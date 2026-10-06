# Routes/recommendationRoutes.py
from fastapi import APIRouter, Depends

from Dependencies.verifyAuthToken import verifyToken
from Controllers.recommendationController import handleSmartRecommendation


router = APIRouter(prefix="/smart-recommendation", tags=["Smart Recommendation"])


@router.get("")
async def smartRecommendation(decoded: dict = Depends(verifyToken)):
    return await handleSmartRecommendation(decoded)