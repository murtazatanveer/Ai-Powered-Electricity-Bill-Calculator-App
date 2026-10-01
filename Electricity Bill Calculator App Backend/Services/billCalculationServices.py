# Services/billCalculationServices.py
"""
Bill calculation service.

Contains:
    - Tariff slab lookup
    - Slab-wise energy cost (Lifeline / Protected / Not Protected)
    - Fixed-charge selection
    - Full bill assembly with all 8 components
    - Firestore tariff fetch + persistence
"""

from datetime import datetime, timezone

from Configuration.config import settings
from Utils.firestoreHelpers import addDoc, getDoc, updateDoc


# ─────────────────────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────────────────────
LIFELINE_THRESHOLD = 100
PROTECTED_THRESHOLD = 200

ELECTRICITY_DUTY_RATE = 0.015   # 1.5%
FC_SURCHARGE_PER_UNIT = 0.43
TV_FEE = 35.0
GST_RATE = 0.18                 # 18%


# ═════════════════════════════════════════════════════════════
# SECTION 1 — Tariff slab lookup helpers
# ═════════════════════════════════════════════════════════════
def _findSlab(slabs: list[dict], slabType: str) -> dict | None:
    """Find a slab entry by its 'type' field."""
    for slab in slabs:
        if slab.get("type") == slabType:
            return slab
    return None


def _getCharges(slabs: list[dict], slabType: str) -> tuple[float, float]:
    """Return (applicableCharges, fixedCharges) for a slab type. Defaults to 0."""
    slab = _findSlab(slabs, slabType)
    if not slab:
        return 0.0, 0.0
    return (
        float(slab.get("applicableCharges", 0)),
        float(slab.get("fixedCharges", 0)),
    )


# ═════════════════════════════════════════════════════════════
# SECTION 2 — Slab-wise energy cost calculation
# ═════════════════════════════════════════════════════════════
def calculateLifelineCost(units: int, slabs: list[dict]) -> tuple[float, list[dict]]:
    """Lifeline: single-tier — all units at one rate."""
    slabType = "upto50" if units <= 50 else "above50"
    rate, _ = _getCharges(slabs, slabType)
    cost = units * rate

    breakdown = [{
        "slabType": slabType,
        "units": units,
        "ratePerUnit": rate,
        "cost": round(cost, 2),
    }]
    return round(cost, 2), breakdown


def calculateProtectedCost(units: int, slabs: list[dict]) -> tuple[float, list[dict]]:
    """Protected: 2 tiers (≤100 and >100)."""
    rate1, _ = _getCharges(slabs, "below100")
    rate2, _ = _getCharges(slabs, "above100")

    if units <= 100:
        cost = units * rate1
        breakdown = [{
            "slabType": "below100",
            "units": units,
            "ratePerUnit": rate1,
            "cost": round(cost, 2),
        }]
        return round(cost, 2), breakdown

    firstTier = 100 * rate1
    secondTier = (units - 100) * rate2
    cost = firstTier + secondTier

    breakdown = [
        {
            "slabType": "below100",
            "units": 100,
            "ratePerUnit": rate1,
            "cost": round(firstTier, 2),
        },
        {
            "slabType": "above100",
            "units": units - 100,
            "ratePerUnit": rate2,
            "cost": round(secondTier, 2),
        },
    ]
    return round(cost, 2), breakdown


def calculateUnprotectedCost(units: int, slabs: list[dict]) -> tuple[float, list[dict]]:
    """Unprotected: cascading 100-unit tiers."""
    tierOrder = [
        ("below100", 100),
        ("below200", 100),
        ("below300", 100),
        ("below400", 100),
        ("below500", 100),
        ("below600", 100),
        ("below700", 100),
        ("above700", None),   # unbounded top tier
    ]

    remaining = units
    totalCost = 0.0
    breakdown: list[dict] = []

    for slabType, tierSize in tierOrder:
        if remaining <= 0:
            break

        rate, _ = _getCharges(slabs, slabType)

        if tierSize is None:  # top unbounded tier
            unitsInTier = remaining
        else:
            unitsInTier = min(remaining, tierSize)

        tierCost = unitsInTier * rate
        totalCost += tierCost
        remaining -= unitsInTier

        breakdown.append({
            "slabType": slabType,
            "units": unitsInTier,
            "ratePerUnit": rate,
            "cost": round(tierCost, 2),
        })

    return round(totalCost, 2), breakdown


def calculateSlabWiseCost(
    units: int,
    status: str,
    tariffData: dict,
) -> tuple[float, list[dict]]:
    """
    Dispatch based on user status.
    status: "Lifeline" | "Protected" | "Not Protected"
    Returns (costOfElectricity, slabWiseBreakdown)
    """
    if status == "Lifeline":
        return calculateLifelineCost(units, tariffData.get("lifeline", []))
    if status == "Protected":
        return calculateProtectedCost(units, tariffData.get("protected", []))
    if status == "Not Protected":
        return calculateUnprotectedCost(units, tariffData.get("unprotected", []))
    return 0.0, []


# ═════════════════════════════════════════════════════════════
# SECTION 3 — Fixed charges selection
# ═════════════════════════════════════════════════════════════
def getFixedCharges(units: int, status: str, tariffData: dict) -> float:
    """Pick fixedCharges from the slab that matches the user's final bracket."""
    if status == "Lifeline":
        slabType = "upto50" if units <= 50 else "above50"
        _, fixed = _getCharges(tariffData.get("lifeline", []), slabType)
        return fixed

    if status == "Protected":
        slabType = "below100" if units <= 100 else "above100"
        _, fixed = _getCharges(tariffData.get("protected", []), slabType)
        return fixed

    if status == "Not Protected":
        if units <= 100:
            slabType = "below100"
        elif units <= 200:
            slabType = "below200"
        elif units <= 300:
            slabType = "below300"
        elif units <= 400:
            slabType = "below400"
        elif units <= 500:
            slabType = "below500"
        elif units <= 600:
            slabType = "below600"
        elif units <= 700:
            slabType = "below700"
        else:
            slabType = "above700"
        _, fixed = _getCharges(tariffData.get("unprotected", []), slabType)
        return fixed

    return 0.0


# ═════════════════════════════════════════════════════════════
# SECTION 4 — Individual bill component calculators
# ═════════════════════════════════════════════════════════════
def _electricityDuty(costOfElectricity: float, fpa: float, qta: float) -> float:
    return round((costOfElectricity + fpa + qta) * ELECTRICITY_DUTY_RATE, 2)


def _fcSurcharge(units: int) -> float:
    return round(units * FC_SURCHARGE_PER_UNIT, 2)


def _fpaCharge(units: int, fpaRate: float) -> float:
    return round(units * fpaRate, 2)


def _qtaCharge(units: int, qtaRate: float) -> float:
    return round(units * qtaRate, 2)


def _gst(
    costOfElectricity: float,
    fixedCharges: float,
    fcSurcharge: float,
    fpa: float,
    qta: float,
    electricityDuty: float,
) -> float:
    base = (
        costOfElectricity
        + fixedCharges
        + fcSurcharge
        + fpa
        + qta
        + electricityDuty
    )
    return round(base * GST_RATE, 2)


# ═════════════════════════════════════════════════════════════
# SECTION 5 — Full bill assembly
# ═════════════════════════════════════════════════════════════
def calculateBill(
    units: int,
    status: str,
    tariffData: dict,
    fpaRate: float,
    qtaRate: float,
) -> dict:
    """
    Compute the full bill per category rules.

    Returns:
        {
            "totalBill": ...,
            "slabWiseEnergyCost": [ ... ],
            "billBreakDown": { ... }
        }
    """
    # 1) Cost of electricity (slab-wise)
    costOfElectricity, slabWiseBreakdown = calculateSlabWiseCost(
        units, status, tariffData
    )

    # 2) Fixed charges (depends on final bracket)
    fixedCharges = getFixedCharges(units, status, tariffData)

    # 3) FPA / QTA
    fpaCharge = _fpaCharge(units, fpaRate)
    qtaCharge = _qtaCharge(units, qtaRate)

    # 4) Electricity Duty (always)
    electricityDuty = _electricityDuty(costOfElectricity, fpaCharge, qtaCharge)

    # 5) Lifeline handling
    isLifeline = (status == "Lifeline")

    if isLifeline:
        fcSurcharge = 0.0
        tvFee = 0.0
        gst = _gst(
            costOfElectricity=costOfElectricity,
            fixedCharges=fixedCharges,
            fcSurcharge=0.0,
            fpa=fpaCharge,
            qta=qtaCharge,
            electricityDuty=electricityDuty,
        )
    else:
        fcSurcharge = _fcSurcharge(units)
        tvFee = TV_FEE
        gst = _gst(
            costOfElectricity=costOfElectricity,
            fixedCharges=fixedCharges,
            fcSurcharge=fcSurcharge,
            fpa=fpaCharge,
            qta=qtaCharge,
            electricityDuty=electricityDuty,
        )

    # 6) Total
    totalBill = round(
        costOfElectricity
        + fixedCharges
        + electricityDuty
        + fcSurcharge
        + fpaCharge
        + qtaCharge
        + tvFee
        + gst,
        2,
    )

    return {
        "totalBill": totalBill,
        "slabWiseEnergyCost": slabWiseBreakdown,
        "billBreakDown": {
            "costOfElectricity": costOfElectricity,
            "fixedCharges": fixedCharges,
            "electricityDuty": electricityDuty,
            "fcSurcharge": fcSurcharge,
            "QTA": qtaCharge,
            "FPA": fpaCharge,
            "tvFee": tvFee,
            "GST": gst,
        },
    }


# ═════════════════════════════════════════════════════════════
# SECTION 6 — Status transition (Rules 1 & 2)
# ═════════════════════════════════════════════════════════════
def decideNewStatus(currentStatus: str, consumedUnits: float) -> str | None:
    """
    Returns the new status if a change is needed, otherwise None.

    Rules:
    1. consumedUnits > 200 and status in (Protected, Lifeline) → Not Protected
    2. consumedUnits > 100 and status == Lifeline              → Protected
    """
    if consumedUnits > PROTECTED_THRESHOLD and currentStatus in ("Protected", "Lifeline"):
        return "Not Protected"

    if consumedUnits > LIFELINE_THRESHOLD and currentStatus == "Lifeline":
        return "Protected"

    return None


# ═════════════════════════════════════════════════════════════
# SECTION 7 — Firestore access
# ═════════════════════════════════════════════════════════════
async def getBillData(uid: str) -> dict | None:
    """Fetch the BillData document for a user. Returns None if missing."""
    return await getDoc("BillData", uid)


async def updateBillStatus(uid: str, newStatus: str) -> None:
    """Update the status field on the BillData document."""
    await updateDoc("BillData", uid, {"status": newStatus})


async def getTariffRates() -> dict | None:
    """Fetch the current TariffRates document. Returns None if missing."""
    return await getDoc("TariffRates", settings.tariff_data_document_id)


# ═════════════════════════════════════════════════════════════
# SECTION 8 — Firestore writes for bill calculation
# ═════════════════════════════════════════════════════════════
async def updateUnitsPresentReading(uid: str, newReading: int) -> None:
    """Update the unitsPresentReading field on the BillData document."""
    await updateDoc("BillData", uid, {"unitsPresentReading": newReading})


async def saveBillBreakdown(uid: str, billResult: dict) -> str:
    """
    Save the bill breakdown to the Readings collection with an
    auto-generated document ID.

    Adds:
        - uid       : user's Firebase UID
        - createdAt : current UTC timestamp

    Returns the newly created document ID.
    """
    doc = {
        "uid": uid,
        "createdAt": datetime.now(timezone.utc),
        **billResult,
    }
    return await addDoc("Readings", doc)