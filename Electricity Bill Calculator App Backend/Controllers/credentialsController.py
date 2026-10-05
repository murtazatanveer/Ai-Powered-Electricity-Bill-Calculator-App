# Controllers/credentialsController.py
from fastapi.responses import JSONResponse

from Models.credentialsModels import Credentials
from Services.userServices import userExists, createUser
from Utils.responseHelper import errorResponse, successResponse


async def handleSetCredentials(credentials: Credentials, decoded: dict) -> JSONResponse:
    try:

        uid = decoded["uid"]
        email = decoded.get("email")

        # 1) Check if user already exists
        if await userExists(uid):
            return errorResponse(409, "User Already Exists")

        # 2) Create user document
        docPath = await createUser(uid=uid, email=email, fullName=credentials.fullName)

        # 3) Success response
        return successResponse(
            201,
            "User Created Sucessfully",
            data={
                "fullName": credentials.fullName,
                "email": email,
                "uid": uid,
                "docPath": docPath,
            },
        )
    except Exception as e:
        return errorResponse(500, f"Internal server error: {str(e)}")
    
    
    
