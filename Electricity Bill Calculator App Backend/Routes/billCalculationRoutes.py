from fastapi import APIRouter, Depends

from Dependencies.verifyAuthToken import verifyToken
from Models.billcalculationModels import BillCalculation
from Controllers.billCalculationController import handleCalculateBill


router = APIRouter(tags=["Bill Calculation"])


@router.post("/bill-calculation")
async def calculateBill(
    bill: BillCalculation,
    decoded: dict = Depends(verifyToken),
):
    return await handleCalculateBill(bill, decoded)