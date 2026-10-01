# Services/billDataServices.py
from datetime import date, datetime
from typing import Any

from Models.billDataModels import BillData
from Utils.firestoreHelpers import docExists, setDoc


# ─────────────────────────────────────────────────────────────
# Bill month validation
# ─────────────────────────────────────────────────────────────
def validateBillMonth(billData: dict[str, Any]) -> tuple[bool, str]:
    """
    Validate that the bill is for the expected current or previous month.
    Returns (isValid, errorMessage). If valid, errorMessage is empty.
    """
    currentBill = billData.get("currentBillDetails") or {}
    billMonthStr = currentBill.get("month")
    readingDate = billData.get("readingDate")

    if not billMonthStr or readingDate is None:
        return False, (
            "Could not determine bill month or reading date from the uploaded bill."
        )

    try:
        billDt = datetime.strptime(billMonthStr.strip(), "%b %Y")
    except ValueError:
        return False, f"Unrecognized bill month format: {billMonthStr}"

    today = date.today()

    if today.day > int(readingDate):
        expectedYear = today.year
        expectedMonth = today.month
    else:
        if today.month == 1:
            expectedYear = today.year - 1
            expectedMonth = 12
        else:
            expectedYear = today.year
            expectedMonth = today.month - 1

    if billDt.year != expectedYear or billDt.month != expectedMonth:
        return False, (
            f"Bill is old. Expected bill for "
            f"{expectedMonth:02d}/{expectedYear}, but got {billMonthStr}."
        )

    return True, ""


# ─────────────────────────────────────────────────────────────
# Status / phase / consumption validation
# ─────────────────────────────────────────────────────────────
def _firstNUnits(readings: list[dict], n: int) -> list[float]:
    return [
        float(r.get("units", 0))
        for r in readings[:n]
        if isinstance(r.get("units"), (int, float))
    ]


def validateStatusRules(
    billData: dict[str, Any],
    status: str,
    meterPhase: str,
) -> tuple[bool, str]:
    """
    Validate consumption pattern based on status:
      - Lifeline       : single-phase AND 12 months each ≤ 100 units
      - Protected      : 6 months each ≤ 200 units
      - Not Protected  : at least ONE of last 6 months > 200 units

    Returns (isValid, errorMessage).
    """
    previousReadings = list(billData.get("previousReadings") or [])
    currentBill = billData.get("currentBillDetails")
    if currentBill:
        previousReadings.insert(0, currentBill)

    if not previousReadings:
        return False, "No previous readings found in the bill data."

    if status == "Lifeline":
        if meterPhase != "Single Phase":
            return False, (
                "Lifeline consumers must have a Single Phase meter. "
                f"Provided: {meterPhase}."
            )

        units12 = _firstNUnits(previousReadings, 12)
        if len(units12) < 12:
            return False, (
                f"Lifeline validation requires 12 months of readings; "
                f"only {len(units12)} available."
            )

        offenders = [(i, u) for i, u in enumerate(units12) if u > 100]
        if offenders:
            monthNames = [r.get("month") for r in previousReadings[:12]]
            bad = ", ".join(f"{monthNames[i]} = {u} units" for i, u in offenders)
            return False, (
                "Lifeline validation failed: monthly consumption "
                f"must be ≤ 100 units for the last 12 months. "
                f"Violations: {bad}."
            )

    elif status == "Protected":
        units6 = _firstNUnits(previousReadings, 6)
        if len(units6) < 6:
            return False, (
                f"Protected validation requires 6 months of readings; "
                f"only {len(units6)} available."
            )

        offenders = [(i, u) for i, u in enumerate(units6) if u > 200]
        if offenders:
            monthNames = [r.get("month") for r in previousReadings[:6]]
            bad = ", ".join(f"{monthNames[i]} = {u} units" for i, u in offenders)
            return False, (
                "Protected validation failed: monthly consumption "
                f"must be ≤ 200 units for the last 6 months. "
                f"Violations: {bad}."
            )

    elif status == "Not Protected":
        units6 = _firstNUnits(previousReadings, 6)
        if len(units6) < 6:
            return False, (
                f"Not Protected validation requires 6 months of readings; "
                f"only {len(units6)} available."
            )

        hasHighMonth = any(u > 200 for u in units6)
        if not hasHighMonth:
            return False, (
                "Not Protected validation failed: no month in the last 6 "
                "shows consumption above 200 units. This usage pattern "
                "suggests the bill should be Protected, not Unprotected."
            )

    else:
        return False, (
            f"Unknown status: {status}. "
            "Expected 'Lifeline', 'Protected', or 'Not Protected'."
        )

    return True, ""


# ─────────────────────────────────────────────────────────────
# Firestore persistence
# ─────────────────────────────────────────────────────────────
async def saveBillData(uid: str, userBillData: BillData) -> tuple[bool, str]:
    """
    Save bill data to Firestore under BillData/{uid}.
    Returns (saved, errorMessage).
    - If a document already exists → (False, "Bill Data Already Exists").
    - On success → (True, "").
    """
    if await docExists("BillData", uid):
        return False, "Bill Data Already Exists"

    await setDoc("BillData", uid, userBillData.model_dump())
    return True, ""