# Routes/credentialsRoutes.py
from fastapi import APIRouter, Depends

from Dependencies.verifyAuthToken import verifyToken
from Models.credentialsModels import Credentials
from Controllers.credentialsController import handleSetCredentials


router = APIRouter(prefix="/user",tags=["Credentials"])


@router.post("/add-credentials")
async def setCredentials(
    credentials: Credentials,
    decoded: dict = Depends(verifyToken)
):
    return await handleSetCredentials(credentials, decoded)