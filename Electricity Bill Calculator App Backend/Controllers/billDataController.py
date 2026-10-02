# Controllers/billDataController.py
from pathlib import Path

from fastapi import UploadFile
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from Configuration.gemini_client import extract_from_image
from Models.billDataModels import BillData
from Prompts.billExtractionPrompt import BILL_EXTRACTION_PROMPT
from Services.billDataServices import saveBillData , validateBillMonth , validateStatusRules
from Utils.extractJson import extractJSON
from Utils.responseHelper import errorResponse, successResponse


ALLOWED_IMAGE_TYPES = {
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/heic",
    "image/heif",
}

MAX_IMAGE_SIZE = int(1.5 * 1024 * 1024)  # 1.5 MB


async def handleBillData(
    billImage: UploadFile,
    disco: str,
    status: str,
    meterPhase: str,
    decoded: dict,
) -> JSONResponse:
    try:
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

        # 4) Send to Gemini
        rawRes = await extract_from_image(
            image_bytes=imageBytes,
            prompt=BILL_EXTRACTION_PROMPT,
            mime_type=billImage.content_type,
        )

        # 5) Extract JSON
        billData = extractJSON(rawRes)

        if not billData.get("success"):
            return JSONResponse(status_code=422, content=billData)

        # # 6) Bill month validation
        # ok, err = validateBillMonth(billData)
        # if not ok:
        #     return errorResponse(422, err)

        # 7) Status / phase / consumption validation
        ok, err = validateStatusRules(billData, status, meterPhase)
        if not ok:
            return errorResponse(422, err)

        # 8) Build model and persist
        previousReadings = list(billData.get("previousReadings") or [])
        currentBill = billData.get("currentBillDetails")
        if currentBill:
            previousReadings.insert(0, currentBill)

        uid = decoded["uid"]

        userBillData = BillData(
            consumerName=billData.get("consumerName"),
            disco=disco,
            status=status,
            meterPhase=meterPhase,
            unitsPresentReading=billData.get("unitsPresentReading"),
            readingDate=billData.get("readingDate"),
            billingHistory=previousReadings,
            monthlyRunningUnits=billData.get("unitsPresentReading")
        )

        
        saved, err = await saveBillData(uid, userBillData)
        if not saved:
            return errorResponse(409, err)

        # 9) Success
        return successResponse(
            201,
            "Bill data and Billing History data successfully added to firestore",
            data={
                "disco": userBillData.disco,
                "status": userBillData.status,
                "meterPhase": userBillData.meterPhase,
                "filename": billImage.filename,
                "size_bytes": len(imageBytes),
                "format": Path(billImage.filename or "").suffix.lower(),
                "content_type": billImage.content_type,
            },
            billDetails=billData,
        )

    except ValidationError as e:
        return errorResponse(422, "Invalid input data", errors=e.errors())

    except Exception as e:
        return errorResponse(500, f"Internal server error: {str(e)}")