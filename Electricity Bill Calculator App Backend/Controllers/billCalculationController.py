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
    updateUnitsPresentReading,
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

    # 3) Compute consumed units
    unitsPresentReading = billData.get("unitsPresentReading")
    if unitsPresentReading is None:
        return errorResponse(422, "unitsPresentReading missing from BillData")

    consumedUnits = bill.units - unitsPresentReading
    if consumedUnits < 0:
        return errorResponse(
            422,
            f"Present reading ({bill.units}) cannot be less than "
            f"stored reading ({unitsPresentReading}).",
        )

    # 4) Status-update check
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

    # 5) Calculate the bill
    fpaRate = bill.FPA or 0.0
    qtaRate = bill.QTA or 0.0

    billResult = calculateBill(
        units=consumedUnits,
        status=currentStatus,
        tariffData=tariffData,
        fpaRate=fpaRate,
        qtaRate=qtaRate,
    )

    # 6) Assemble the document to save in Readings/{autoId}
    readingsDoc = {
        "consumedUnits": consumedUnits,
        "status": currentStatus,
        "statusUpdated": statusUpdated,
        "totalBill": billResult["totalBill"],
        "slabWiseEnergyCost": billResult["slabWiseEnergyCost"],
        "billBreakDown": billResult["billBreakDown"],
    }

    # 7) Persist to Firestore
    await updateUnitsPresentReading(uid, bill.units)
    readingsDocId = await saveBillBreakdown(uid, readingsDoc)

    # 8) Response
    return successResponse(
        200,
        "Bill calculated successfully",
        data={
            "readingsDocId": readingsDocId,
            **readingsDoc,
        },
    )