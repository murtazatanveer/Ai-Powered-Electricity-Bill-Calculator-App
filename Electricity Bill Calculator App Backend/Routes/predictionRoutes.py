# Routes/predictionRoutes.py
from fastapi import APIRouter, Depends

from Dependencies.verifyAuthToken import verifyToken
from Models.mlInputModel import ModelInput,ModelInputUpdate
from Controllers.predictionController import (
    handlePredictBill,
    handleSetModelInput,
    handleUpdateModelInput
)


router = APIRouter(prefix="/ml-model",tags=["ML Model Prediction"])


@router.post("/")
async def predictBill(
    modelInput: ModelInput,
    decoded: dict = Depends(verifyToken),
):
    return await handlePredictBill(modelInput, decoded)


@router.post("/set-model-input")
async def setModelInput(
    modelInput: ModelInput,
    decoded: dict = Depends(verifyToken),
):
    return await handleSetModelInput(modelInput, decoded)

@router.put("/update-model-input")
async def updateModelInput(
    modelInput: ModelInputUpdate,
    decoded: dict = Depends(verifyToken),
):
    return await handleUpdateModelInput(modelInput, decoded)