# Controllers/recommendationController.py
from fastapi.responses import JSONResponse

from Services.recommendationServices import generateSmartRecommendation
from Utils.responseHelper import errorResponse, successResponse


async def handleSmartRecommendation(decoded: dict) -> JSONResponse:
    uid = decoded["uid"]

    recommendation = await generateSmartRecommendation(uid)
    if recommendation is None:
        return errorResponse(
            404,
            "No intermediate reading found for the current cycle.",
        )

    return successResponse(
        200,
        "Smart recommendation generated successfully",
        data=recommendation,
    )