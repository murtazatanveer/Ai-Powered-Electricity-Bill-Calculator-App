# Controllers/billCalculationController.py
from fastapi.responses import JSONResponse
from datetime import datetime
from fastapi import UploadFile

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
    getReadingsByUid,
    getReadingById,
    deleteReading,
    extractMeterReading
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
        return errorResponse(422, "unitsPresentReading missing from BillData")

    monthlyRunningUnits = billData.get("monthlyRunningUnits")

    # 3a) Sanity check — reading can't decrease within the cycle
    if monthlyRunningUnits is not None and bill.units <= monthlyRunningUnits:
        return errorResponse(
            422,
            f"New reading {bill.units} cannot be less than or equal to "
            f"previous monthly reading {monthlyRunningUnits}.",
        )

    # 4) Compute consumed units from CYCLE BASELINE
    consumedUnits = bill.units - unitsPresentReading
    if consumedUnits < 0:
        return errorResponse(
            422,
            f"New reading {bill.units} cannot be less than "
            f"cycle baseline {unitsPresentReading}.",
        )

    # 5) Status-update check (Rules 1 & 2)
    previousStatus = billData.get("status")     # ← capture BEFORE transition
    currentStatus = previousStatus

    newStatus = decideNewStatus(
        currentStatus=currentStatus,
        consumedUnits=consumedUnits,
    )
    statusUpdated = False
    if newStatus and newStatus != currentStatus:
        await updateBillStatus(uid, newStatus)
        currentStatus = newStatus
        statusUpdated = True

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
        "previousStatus": previousStatus,       
        "statusUpdated": statusUpdated,
        "totalBill": billResult["totalBill"],
        "slabWiseEnergyCost": billResult["slabWiseEnergyCost"],
        "billBreakDown": billResult["billBreakDown"],
    }

    # 8) Persist to Firestore
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


async def handleReadingDate(bill: BillCalculation, decoded: dict) -> JSONResponse:
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
    previousStatus = billData.get("status")     # ← capture BEFORE transition
    currentStatus = previousStatus
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
    month = datetime.now().strftime("%b %Y")

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
        "previousStatus": previousStatus,       # ← NEW
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
# Controllers/billCalculationController.py (append)

async def handleGetReadings(decoded: dict) -> JSONResponse:
    try:
        uid = decoded["uid"]

        readings = await getReadingsByUid(uid)

        return successResponse(
        200,
        "Readings fetched successfully",
        data=readings,
        )
    except Exception as e:
        return errorResponse(500, f"Internal server error: {str(e)}")  
    
# Controllers/billCalculationController.py (append)

async def handleGetReadingById(docId: str, decoded: dict) -> JSONResponse:
    try:
        reading = await getReadingById(docId)
        if reading is None:
            return errorResponse(404, "Reading not found")

        return successResponse(
            200,
            "Reading fetched successfully",
            data=reading,
        )
    except Exception as e:
        return errorResponse(500, f"Internal server error: {str(e)}")
    
    # Controllers/billCalculationController.py (append)

async def handleGetTariffRates() -> JSONResponse:
    try:
        tariffData = await getTariffRates()
        if tariffData is None:
            return errorResponse(404, "Tariff rates not found")

        # Convert any Firestore timestamp fields to ISO strings
        for key, value in tariffData.items():
            if hasattr(value, "isoformat"):
                tariffData[key] = value.isoformat()

        return successResponse(
            200,
            "Tariff rates fetched successfully",
            data=tariffData,
        )
    except Exception as e:
        return errorResponse(500, f"Internal server error: {str(e)}")
    

# Controllers/billCalculationController.py (append)

async def handleDeleteReading(docId: str, decoded: dict) -> JSONResponse:
    try:
        uid = decoded["uid"]

        deleted, err = await deleteReading(docId, uid)
        if not deleted:
            status = 404 if err == "Reading not found" else 500
            return errorResponse(status, err)

        return successResponse(
            200,
            "Reading deleted successfully",
            data={"docId": docId},
        )
    except Exception as e:
        return errorResponse(500, f"Internal server error: {str(e)}")
    

ALLOWED_IMAGE_TYPES = {
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/heic",
    "image/heif",
}

MAX_IMAGE_SIZE = int(1.5 * 1024 * 1024)  # 1.5 MB

async def handleMeterReading(
    billImage: UploadFile,
    fpa: float,
    qta: float,
    decoded: dict,
) -> JSONResponse:
    uid = decoded["uid"]

    # 1) Validate content type
    if billImage.content_type not in ALLOWED_IMAGE_TYPES:
        return errorResponse(
            415,
            f"Unsupported file type: {billImage.content_type}. "
            f"Allowed formats: PNG, JPEG, JPG, WEBP, HEIC, HEIF.",
        )

    # 2) Read image bytes
    imageBytes = await billImage.read()
    if not imageBytes:
        return errorResponse(400, "Empty image file")
    # 3) Size check
    if len(imageBytes) > MAX_IMAGE_SIZE:
        return errorResponse(
            413, "Image size exceeds 1.5 MB. Please upload a smaller image."
        )

    # 4) Gemini extraction
    try:
        extraction = await extractMeterReading(imageBytes, billImage.content_type)
    except Exception as e:
        return errorResponse(500, f"Gemini extraction failed: {str(e)}")

    # 5) Handle Gemini's response
    if not extraction.get("success"):
        return errorResponse(
            422,
            extraction.get("message", "invalid meter image"),
        )

    units = extraction.get("units")
    if not isinstance(units, int) or units < 0:
        return errorResponse(422, "Invalid units value from extraction")

    # 6) Fetch user's BillData
    billData = await getBillData(uid)
    if billData is None:
        return errorResponse(409, "Bill Data not found")

    # 7) Fetch tariff rates
    tariffData = await getTariffRates()
    if tariffData is None:
        return errorResponse(500, "Tariff rates not found in Firestore")

    # 8) Status transition (Rules 1 & 2)
    currentStatus = billData.get("status")
    newStatus = decideNewStatus(
        currentStatus=currentStatus,
        consumedUnits=units,
    )
    statusUpdated = False
    if newStatus and newStatus != currentStatus:
        await updateBillStatus(uid, newStatus)
        currentStatus = newStatus
        statusUpdated = True

    # 9) Calculate the bill
    billResult = calculateBill(
        units=units,
        status=currentStatus,
        tariffData=tariffData,
        fpaRate=fpa or 0.0,
        qtaRate=qta or 0.0,
    )

    # 10) Build readings doc
    readingsDoc = {
        "consumedUnits": units,
        "status": currentStatus,
        "statusUpdated": statusUpdated,
        "totalBill": billResult["totalBill"],
        "slabWiseEnergyCost": billResult["slabWiseEnergyCost"],
        "billBreakDown": billResult["billBreakDown"],
    }

    # 11) Persist
    await saveBillBreakdown(uid, readingsDoc)

    # 12) Response
    return successResponse(
        200,
        "units fetched successfully",
        data={
            "units": units,
            "status": currentStatus,
            "statusUpdated": statusUpdated,
            "totalBill": billResult["totalBill"],
            "slabWiseEnergyCost": billResult["slabWiseEnergyCost"],
            "billBreakDown": billResult["billBreakDown"],
        },
    )