# Services/recommendationServices.py
"""
Smart Recommendation service.
"""

from datetime import date
from statistics import mean
from typing import Any

from Services.billCalculationServices import (
    getBillData,
    getTariffRates,
    calculateBill,
)


# ─────────────────────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────────────────────
HISTORY_WINDOW = 6
LIFELINE_THRESHOLD = 100
PROTECTED_THRESHOLD = 200

NEXT_STATUS_MAP = {
    "Lifeline": ("Protected", LIFELINE_THRESHOLD),
    "Protected": ("Not Protected", PROTECTED_THRESHOLD),
    "Not Protected": (None, None),
}


# ─────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────
def _cycleStartDate(readingDate: int, today: date) -> date:
    """Return the date the current cycle started."""
    if today.day >= readingDate:
        year, month = today.year, today.month
    else:
        if today.month == 1:
            year, month = today.year - 1, 12
        else:
            year, month = today.year, today.month - 1

    return date(year, month, readingDate)


def _nextReadingDate(readingDate: int, today: date) -> date:
    """Return the next reading date."""
    if today.day < readingDate:
        return date(today.year, today.month, readingDate)

    if today.month == 12:
        return date(today.year + 1, 1, readingDate)
    return date(today.year, today.month + 1, readingDate)


def _historicalAverage(billingHistory: list[dict]) -> float | None:
    """Mean of the last N months' units. None if not enough history."""
    units = [
        r.get("units")
        for r in billingHistory[:HISTORY_WINDOW]
        if isinstance(r.get("units"), (int, float))
    ]
    return round(mean(units), 2) if len(units) >= 3 else None


# ─────────────────────────────────────────────────────────────
# Main generator
# ─────────────────────────────────────────────────────────────
async def generateSmartRecommendation(uid: str) -> dict[str, Any] | None:
    """
    Returns the smart recommendation dict, or None if not enough data
    (including "no intermediate reading this cycle").
    """
    # 1) Fetch BillData
    billData = await getBillData(uid)
    if billData is None:
        return None

    readingDate = billData.get("readingDate")
    unitsPresentReading = billData.get("unitsPresentReading")
    monthlyRunningUnits = billData.get("monthlyRunningUnits")
    currentStatus = billData.get("status")
    billingHistory = billData.get("billingHistory") or []

    if readingDate is None or unitsPresentReading is None or monthlyRunningUnits is None:
        return None

    # 2) Require an intermediate reading for the current cycle
    #    If monthlyRunningUnits == unitsPresentReading, no reading has been
    #    submitted since the cycle started → 404.
    if monthlyRunningUnits <= unitsPresentReading:
        return None

    # 3) Units so far this cycle
    unitsSoFar = monthlyRunningUnits - unitsPresentReading

    # 4) Days elapsed / remaining
    today = date.today()
    cycleStart = _cycleStartDate(readingDate, today)
    nextReadingDate = _nextReadingDate(readingDate, today)

    daysElapsed = (today - cycleStart).days
    daysRemaining = (nextReadingDate - today).days

    if daysElapsed <= 0:
        return None

    # 5) Daily rate + projection
    dailyRate = round(unitsSoFar / daysElapsed, 2)
    projectedMonthUnits = round(unitsSoFar + (dailyRate * daysRemaining), 2)

    # 6) Historical average
    historicalAverage = _historicalAverage(billingHistory)

    percentageVsAverage = None
    if historicalAverage and historicalAverage > 0:
        percentageVsAverage = round(
            (projectedMonthUnits - historicalAverage) / historicalAverage * 100, 2
        )

    # 7) I1 — daily rate vs. average daily rate
    averageDailyRate = None
    dailyRateChangePercent = None
    if historicalAverage and historicalAverage > 0:
        averageDailyRate = round(historicalAverage / 30, 2)
        if averageDailyRate > 0:
            dailyRateChangePercent = round(
                (dailyRate - averageDailyRate) / averageDailyRate * 100, 2
            )

    # 8) Next status threshold
    nextStatus, nextThreshold = NEXT_STATUS_MAP.get(currentStatus, (None, None))
    willCrossThreshold = (
        nextThreshold is not None and projectedMonthUnits > nextThreshold
    )

    # 9) Bill impact
    billImpact = None
    if willCrossThreshold and nextStatus:
        tariffData = await getTariffRates()
        if tariffData:
            currBill = calculateBill(
                units=int(round(projectedMonthUnits)),
                status=currentStatus,
                tariffData=tariffData,
                fpaRate=0.0,
                qtaRate=0.0,
            )
            nextBill = calculateBill(
                units=int(round(projectedMonthUnits)),
                status=nextStatus,
                tariffData=tariffData,
                fpaRate=0.0,
                qtaRate=0.0,
            )
            billImpact = {
                "currentBillAtCurrentStatus": currBill["totalBill"],
                "projectedBillAtNextStatus": nextBill["totalBill"],
                "difference": round(
                    nextBill["totalBill"] - currBill["totalBill"], 2
                ),
            }

    # 10) Headline + suggestions
    headlineParts = []
    if historicalAverage:
        headlineParts.append(
            f"At your current pace you'll consume ~{int(projectedMonthUnits)} units"
        )
        if percentageVsAverage and percentageVsAverage > 0:
            headlineParts.append(
                f"that's {percentageVsAverage:.0f}% above your {int(historicalAverage)}-unit average."
            )
        elif percentageVsAverage is not None:
            headlineParts.append(
                f"that's {abs(percentageVsAverage):.0f}% below your {int(historicalAverage)}-unit average."
            )
    else:
        headlineParts.append(
            f"At your current pace you'll consume ~{int(projectedMonthUnits)} units this month."
        )
    headline = " ".join(headlineParts)

    suggestions = []
    if dailyRateChangePercent is not None:
        direction = "faster" if dailyRateChangePercent > 0 else "slower"
        suggestions.append(
            f"Your daily pace is {abs(dailyRateChangePercent):.0f}% {direction} than your usual."
        )

    if willCrossThreshold and nextThreshold:
        gap = round(nextThreshold - projectedMonthUnits, 2)
        if gap > 0:
            suggestions.append(
                f"You're on track to cross the {nextThreshold}-unit threshold. "
                f"Reduce ~{abs(int(gap))} units to stay {currentStatus}."
            )
        else:
            suggestions.append(
                f"You're on track to move from {currentStatus} to {nextStatus}."
            )

    if billImpact:
        suggestions.append(
            f"If you cross, your bill could go up by ~Rs {billImpact['difference']:.0f}."
        )

    if daysRemaining <= 3:
        suggestions.append(
            f"Reading date is close — only {daysRemaining} day(s) remaining."
        )

    # 11) Assemble
    return {
        "unitsSoFar": unitsSoFar,
        "daysElapsed": daysElapsed,
        "daysRemaining": daysRemaining,
        "dailyRate": dailyRate,
        "averageDailyRate": averageDailyRate,
        "projectedMonthUnits": projectedMonthUnits,
        "historicalAverage": historicalAverage,
        "percentageVsAverage": percentageVsAverage,
        "dailyRateChangePercent": dailyRateChangePercent,
        "currentStatus": currentStatus,
        "nextStatus": nextStatus,
        "nextThreshold": nextThreshold,
        "willCrossThreshold": willCrossThreshold,
        "billImpact": billImpact,
        "headline": headline,
        "suggestions": suggestions,
    }