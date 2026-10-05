# Routes/credentialsRoutes.py
from fastapi import APIRouter, Depends,Path
from pydantic import EmailStr
from typing import Annotated
from Dependencies.verifyAuthToken import verifyToken
from Models.credentialsModels import Credentials
from Controllers.credentialsController import handleSetCredentials,handleEmailExists


router = APIRouter(prefix="/user",tags=["Credentials"])


@router.post("/add-credentials")
async def setCredentials(
    credentials: Credentials,
    decoded: dict = Depends(verifyToken)
):
    return await handleSetCredentials(credentials, decoded)

@router.get("/{email}")
async def checkEmailExists(email: Annotated[EmailStr,Path(...,dexcription="Enter your email")]):
    return await handleEmailExists(email)