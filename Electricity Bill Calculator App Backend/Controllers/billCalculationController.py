# Controllers/billCalculationController.py
from fastapi.responses import JSONResponse
from datetime import datetime

from Models.billcalculationModels import BillCalculation
from Services.billCalculationServices import (
    calculateBill,
    decideNewStatus,
    getBillData,
    getTariffRates,
    updateBillStatus,
    updateMonthlyRunningUnits,
    hasReadingDatePassed,
    prependBillingHistory,
    resetCycle,
    saveBillBreakdown,
    shouldRevertToProtected,
)

from Utils.responseHelper import errorResponse, successResponse


async def handleCalculateBill(bill: BillCalculation, decoded: dict) -> JSONResponse:
    uid = decoded["uid"]

    # 1) Fetch user's BillData
    billData = await getBillData(uid)
    if billData is None:
        return errorResponse(409, "Bill Data not found")

    # 2) Fetch tariff rates
    tariffData = await getTariffRates()
    if tariffData is None:
        return errorResponse(500, "Tariff rates not found in Firestore")

    # 3) Fetch cycle baseline + latest monthly reading
    unitsPresentReading = billData.get("unitsPresentReading")
    if unitsPresentReading is None:
        return errorResponse(409, "unitsPresentReading missing from BillData")

    monthlyRunningUnits = billData.get("monthlyRunningUnits")

    # 3a) Sanity check — reading can't decrease within the cycle
    if monthlyRunningUnits is not None and bill.units < monthlyRunningUnits:
        return errorResponse(
            422,
            f"New reading ({bill.units}) cannot be less than "
            f"previous monthly reading ({monthlyRunningUnits}).",
        )

    # 4) Compute consumed units from CYCLE BASELINE
    consumedUnits = bill.units - unitsPresentReading
    if consumedUnits < 0:
        return errorResponse(
            422,
            f"New reading ({bill.units}) cannot be less than "
            f"cycle baseline ({unitsPresentReading}).",
        )

    # 5) Status-update check (Rules 1 & 2)
    currentStatus = billData.get("status")
    newStatus = decideNewStatus(
        currentStatus=currentStatus,
        consumedUnits=consumedUnits,
    )
    statusUpdated = False
    if newStatus and newStatus != currentStatus:
        await updateBillStatus(uid, newStatus)
        statusUpdated = True
        currentStatus = newStatus

    # 6) Calculate the bill
    fpaRate = bill.FPA or 0.0
    qtaRate = bill.QTA or 0.0

    billResult = calculateBill(
        units=consumedUnits,
        status=currentStatus,
        tariffData=tariffData,
        fpaRate=fpaRate,
        qtaRate=qtaRate,
    )

    # 7) Assemble the readings document
    readingsDoc = {
        "consumedUnits": consumedUnits,
        "status": currentStatus,
        "statusUpdated": statusUpdated,
        "totalBill": billResult["totalBill"],
        "slabWiseEnergyCost": billResult["slabWiseEnergyCost"],
        "billBreakDown": billResult["billBreakDown"],
    }

    # 8) Persist to Firestore
    #    - unitsPresentReading stays UNCHANGED (cycle baseline)
    #    - monthlyRunningUnits gets updated to the latest reading
    await updateMonthlyRunningUnits(uid, bill.units)
    readingsDocId = await saveBillBreakdown(uid, readingsDoc)

    # 9) Response
    return successResponse(
        200,
        "Bill calculated successfully",
        data={
            "readingsDocId": readingsDocId,
            **readingsDoc,
        },
    )


async def handleReadingDate(
    bill: BillCalculation,
    decoded: dict,
) -> JSONResponse:
    uid = decoded["uid"]

    # 1) Fetch BillData
    billData = await getBillData(uid)
    if billData is None:
        return errorResponse(409, "Bill Data not found")

    # 2) Fetch tariff rates
    tariffData = await getTariffRates()
    if tariffData is None:
        return errorResponse(500, "Tariff rates not found in Firestore")

    # 3) Validate reading date has passed
    readingDate = billData.get("readingDate")
    if readingDate is None:
        return errorResponse(422, "readingDate missing from BillData")

    if not hasReadingDatePassed(readingDate):
        return errorResponse(
            422,
            f"Reading date ({readingDate}) has not been reached yet.",
        )

    # 4) Validate new reading >= monthlyRunningUnits
    monthlyRunningUnits = billData.get("monthlyRunningUnits")
    if monthlyRunningUnits is None:
        return errorResponse(422, "monthlyRunningUnits missing from BillData")

    if bill.units < monthlyRunningUnits:
        return errorResponse(
            422,
            f"New reading ({bill.units}) must be >= "
            f"monthly running units ({monthlyRunningUnits}).",
        )

    # 5) Compute consumed units
    unitsPresentReading = billData.get("unitsPresentReading")
    if unitsPresentReading is None:
        return errorResponse(422, "unitsPresentReading missing from BillData")

    consumedUnits = bill.units - unitsPresentReading

    # 6) Status logic
    currentStatus = billData.get("status")
    billingHistory = billData.get("billingHistory") or []
    statusUpdated = False

    # 6a) Escalation (Rules 1 & 2)
    newStatus = decideNewStatus(
        currentStatus=currentStatus,
        consumedUnits=consumedUnits,
    )
    if newStatus and newStatus != currentStatus:
        await updateBillStatus(uid, newStatus)
        currentStatus = newStatus
        statusUpdated = True

    # 6b) Rule 5 — revert Not Protected → Protected (only if no escalation)
    if not statusUpdated and shouldRevertToProtected(
        currentStatus, consumedUnits, billingHistory
    ):
        await updateBillStatus(uid, "Protected")
        currentStatus = "Protected"
        statusUpdated = True

    # 7) Calculate the bill
    fpaRate = bill.FPA or 0.0
    qtaRate = bill.QTA or 0.0

    billResult = calculateBill(
        units=consumedUnits,
        status=currentStatus,
        tariffData=tariffData,
        fpaRate=fpaRate,
        qtaRate=qtaRate,
    )

    # 8) Build the billingHistory entry
    month = datetime.now().strftime("%b %Y")   # e.g., "Sep 2026"

    historyEntry = {
        "bill": billResult["totalBill"],
        "month": month,
        "units": consumedUnits,
        "billStructure": {
            "slabWiseEnergyCost": billResult["slabWiseEnergyCost"],
            "billBreakDown": billResult["billBreakDown"],
        },
    }

    # 9) Persist
    await prependBillingHistory(uid, historyEntry)
    await saveBillBreakdown(uid, {
        "consumedUnits": consumedUnits,
        "status": currentStatus,
        "statusUpdated": statusUpdated,
        "totalBill": billResult["totalBill"],
        "slabWiseEnergyCost": billResult["slabWiseEnergyCost"],
        "billBreakDown": billResult["billBreakDown"],
    })
    await resetCycle(uid, bill.units)

    # 10) Response
    return successResponse(
        200,
        "Monthly reading recorded and bill calculated",
        data={
            "month": month,
            "consumedUnits": consumedUnits,
            "currentStatus": currentStatus,
            "statusUpdated": statusUpdated,
            "totalBill": billResult["totalBill"],
            "slabWiseEnergyCost": billResult["slabWiseEnergyCost"],
            "billBreakDown": billResult["billBreakDown"],
        },
    )