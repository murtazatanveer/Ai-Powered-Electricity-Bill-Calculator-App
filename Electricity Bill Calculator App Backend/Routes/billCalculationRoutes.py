from fastapi import APIRouter, Depends

from Dependencies.verifyAuthToken import verifyToken
from Models.billcalculationModels import BillCalculation
from Controllers.billCalculationController import handleCalculateBill
from Controllers.billCalculationController import handleReadingDate


router = APIRouter(prefix="/bill-calculation",tags=["Bill Calculation"])


@router.post("")
async def calculateBill(
    bill: BillCalculation,
    decoded: dict = Depends(verifyToken),
):
    return await handleCalculateBill(bill, decoded)

@router.post("/reading-date")
async def readingDate(
    bill: BillCalculation,
    decoded: dict = Depends(verifyToken),
):
    return await handleReadingDate(bill, decoded)