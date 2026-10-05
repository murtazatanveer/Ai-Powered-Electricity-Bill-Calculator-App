# Routes/billCalculationRoutes.py
from fastapi import APIRouter, Depends

from Dependencies.verifyAuthToken import verifyToken
from Models.billcalculationModels import BillCalculation
from Controllers.billCalculationController import (
    handleCalculateBill,
    handleGetReadingById,
    handleGetReadings,
    handleGetTariffRates
)


router = APIRouter(prefix="/bill-calculation", tags=["Bill Calculation"])


# 1. Specific paths first
@router.post("")
async def calculateBill(
    bill: BillCalculation,
    decoded: dict = Depends(verifyToken),
):
    return await handleCalculateBill(bill, decoded)


@router.get("/get-readings")
async def getReadingsRoute(decoded: dict = Depends(verifyToken)):
    return await handleGetReadings(decoded)

@router.get("/get-tariffrates")
async def getTariffRatesRoute(decoded: dict = Depends(verifyToken)):
    return await handleGetTariffRates()

@router.get("/{docId}")
async def getReadingByIdRoute(
    docId: str,
    decoded: dict = Depends(verifyToken),
):
    return await handleGetReadingById(docId, decoded)

