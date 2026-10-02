# Controllers/billCalculationController.py
from fastapi.responses import JSONResponse

from Models.billcalculationModels import BillCalculation
from Services.billCalculationServices import (
    calculateBill,
    decideNewStatus,
    getBillData,
    getTariffRates,
    saveBillBreakdown,
    updateBillStatus,
    updateMonthlyRunningUnits,
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