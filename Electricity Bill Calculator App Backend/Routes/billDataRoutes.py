# Routes/billDataRoutes.py
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, File, Form, UploadFile

from Dependencies.verifyAuthToken import verifyToken
from Controllers.billDataController import handleBillData,handleGetBillData


router = APIRouter(prefix="/bill-data",tags=["Bill Data"])


@router.post("")
async def setBillData(
    disco: Annotated[
        Literal[
            "IESCO", "LESCO", "PESCO", "GEPCO", "FESCO",
            "MEPCO", "HESCO", "SEPCO", "QESCO",
            "K-Electric", "TESCO", "HAZECO",
        ],
        Form(...),
    ],
    status: Annotated[
        Literal["Protected", "Not Protected", "Lifeline"],
        Form(...),
    ],
    meterPhase: Annotated[
        Literal["Single Phase", "Three Phase"],
        Form(...),
    ],
    billImage: UploadFile = File(...),
    decoded: dict = Depends(verifyToken),
):
    return await handleBillData(
        billImage=billImage,
        disco=disco,
        status=status,
        meterPhase=meterPhase,
        decoded=decoded,
    )


@router.get("/get-bill-data")
async def getBillDataRoute(decoded: dict = Depends(verifyToken)):
    return await handleGetBillData(decoded)