from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, UploadFile,Path

from Dependencies.verifyAuthToken import verifyToken
from Models.billcalculationModels import BillCalculation
from Controllers.billCalculationController import (
    handleCalculateBill,
    handleDeleteReading,
    handleGetReadingById,
    handleGetReadings,
    handleGetTariffRates,
    handleMeterReading,
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
    docId: Annotated[str,Path(...,description="Enter Firestore Doc Id")],
    decoded: dict = Depends(verifyToken),
):
    return await handleGetReadingById(docId, decoded)

@router.delete("/{docId}")
async def deleteReadingRoute(
    docId: Annotated[str,Path(...,description="Enter Firestore Doc Id")],
    decoded: dict = Depends(verifyToken),
):
    return await handleDeleteReading(docId, decoded)


@router.post("/meter-reading")
async def meterReadingRoute(
    billImage: UploadFile = File(...),
    FPA: Annotated[float, Form()] = 0.0,
    QTA: Annotated[float, Form()] = 0.0,
    decoded: dict = Depends(verifyToken),
):
    return await handleMeterReading(
        billImage=billImage,
        fpa=FPA,
        qta=QTA,
        decoded=decoded,
    )

