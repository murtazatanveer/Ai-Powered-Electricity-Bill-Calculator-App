# Controllers/predictionController.py
from datetime import datetime, timezone

from fastapi.responses import JSONResponse

from Models.mlInputModel import ModelInput,ModelInputUpdate
from Services.billCalculationServices import (
    calculateBill,
    decideNewStatus,
    getBillData,
    getTariffRates,
)
from Services.predictionServices import (
    mapPredictionToUnits,
    predictBill,
    savePrediction,
)
from Services.modelInputServices import (saveModelInput,modelInputExists,mergeModelInput)
from Utils.responseHelper import errorResponse, successResponse


async def handlePredictBill(modelInput: ModelInput, decoded: dict) -> JSONResponse:
    try:
        uid = decoded["uid"]

        # 1) Fetch user's BillData
        billData = await getBillData(uid)
        if billData is None:
            return errorResponse(409, "Bill Data not found")

        billingHistory = billData.get("billingHistory") or []
        if not billingHistory:
            return errorResponse(422, "No billing history found in BillData")

        # 2) ML prediction
        try:
            predictedBill = predictBill(modelInput)
        except RuntimeError as e:
            return errorResponse(500, str(e))

        # 3) Quantile mapping → Pakistani units
        mapping = mapPredictionToUnits(predictedBill, billingHistory)
        if not mapping.get("success"):
            return errorResponse(500, mapping.get("reason", "Mapping failed"))

        mappedUnits = int(round(mapping["mappedUnits"]))

        # 4) Determine effective status for billing (no DB write on BillData)
        currentStatus = billData.get("status")
        newStatus = decideNewStatus(
            currentStatus=currentStatus,
            consumedUnits=mappedUnits,
        )
        effectiveStatus = newStatus or currentStatus

        # 5) Fetch tariff rates
        tariffData = await getTariffRates()
        if tariffData is None:
            return errorResponse(500, "Tariff rates not found in Firestore")

        # 6) Calculate the bill using the EFFECTIVE status
        fpaRate = modelInput.FPA or 0.0
        qtaRate = modelInput.QTA or 0.0

        billResult = calculateBill(
            units=mappedUnits,
            status=effectiveStatus,
            tariffData=tariffData,
            fpaRate=fpaRate,
            qtaRate=qtaRate,
        )

        # 7) Save prediction to Firestore
        predictionDoc = {
            "uid": uid,
            "consumedUnits": mappedUnits,
            "currentStatus": currentStatus,
            "effectiveStatus": effectiveStatus,
            "totalBill": billResult["totalBill"],
            "billBreakDown": billResult["billBreakDown"],
            "slabWiseEnergyCost": billResult["slabWiseEnergyCost"],
            "createdAt": datetime.now(timezone.utc),
        }

        predictionId = await savePrediction(predictionDoc)

        # 8) Response
        return successResponse(
            200,
            "Bill predicted successfully",
            data={
                "predictionId": predictionId,
                "predictedBillBDT": round(predictedBill, 2),
                "bucketIndex": mapping["bucketIndex"],
                "mappedUnits": mappedUnits,
                "unitsPercentiles": mapping["unitsPercentiles"],
                "currentStatus": currentStatus,
                "effectiveStatus": effectiveStatus,
                "statusWouldChange": effectiveStatus != currentStatus,
                "totalBill": billResult["totalBill"],
                "slabWiseEnergyCost": billResult["slabWiseEnergyCost"],
                "billBreakDown": billResult["billBreakDown"],
            },
        )
    except Exception as e:
        return errorResponse(500, f"Internal server error: {str(e)}")

# /set-model-input
async def handleSetModelInput(
    modelInput: ModelInput,
    decoded: dict,
) -> JSONResponse:
    try:
        uid = decoded["uid"]

        # 1) Reject if already exists
        if await modelInputExists(uid):
            return errorResponse(409, "Model Input already exists")

        # 2) Exclude FPA and QTA
        data = modelInput.model_dump(exclude={"FPA", "QTA"})

        # 3) Save to Firestore
        await saveModelInput(uid, data)

        # 4) Success
        return successResponse(
            201,
            "Model input saved successfully",
            data={
                "uid": uid,
                "docPath": f"ModelInputs/{uid}",
                "fields": list(data.keys()),
            },
        )
    except Exception as e:
        return errorResponse(500, f"Internal server error: {str(e)}")

async def handleUpdateModelInput(
    modelInput: ModelInputUpdate,
    decoded: dict,
) -> JSONResponse:
    try:
        uid = decoded["uid"]

        # 1) Reject if the document doesn't exist yet
        if not await modelInputExists(uid):
            return errorResponse(404, "Model Input not found. Use /set-model-input first.")

        # 2) Only include fields the client actually sent
        data = modelInput.model_dump(exclude_unset=True, exclude_none=True)

        if not data:
            return errorResponse(400, "No fields provided to update.")

        # 3) Partial update — merges into the existing document
        await mergeModelInput(uid, data)

        # 4) Success
        return successResponse(
            200,
            "Model input updated successfully",
            data={
                "uid": uid,
                "docPath": f"ModelInputs/{uid}",
                "updatedFields": list(data.keys()),
            },
        )
    except Exception as e:
        return errorResponse(500, f"Internal server error: {str(e)}")