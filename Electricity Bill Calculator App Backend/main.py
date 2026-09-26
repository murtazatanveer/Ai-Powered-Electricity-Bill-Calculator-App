# main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI,Header,Depends,HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel,Field
from typing import Annotated

from Configuration.config import settings
from Configuration.firestore_client import get_db, close_db
from Configuration.firebase_client import get_firebase_app,get_auth



@asynccontextmanager
async def lifespan(app: FastAPI):
    # Firestore (async)
    get_db()
    print(f"✅ Firestore client ready → {settings.gcp_project_id}")

    # Firebase Admin (sync, initialized once)
    get_firebase_app()
    firebase_project = settings.firebase_project_id or settings.gcp_project_id
    print(f"✅ Firebase Admin ready → {firebase_project}")

    yield

    await close_db()
    print("🔌 Firestore client closed")


app = FastAPI(
    title="Electricity Bill Calculator API",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/")
def welcome_message():
    return {
        "message": "Welcome to Electricity Bill Calculator App Backend",
        "success": True,
    }

def verifyToken(authToken: Annotated[str,Header(...,description="Provide Firebase Auth Id Token")]) -> dict:
    auth=get_auth()
    
    try:
        if not authToken.startswith("Bearer_"):         
            raise HTTPException(status_code=401,detail="Invalid authorization header format")
        
        token = authToken.split("Bearer_", 1)[1].strip()

        if not token:
            raise HTTPException(status_code=401,detail="Missing token")

        decoded = auth.verify_id_token(token,check_revoked=True)
        return decoded
    
    except HTTPException:
        raise  

    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=401,
            detail="Token has expired",
        )
    except auth.RevokedIdTokenError:
        raise HTTPException(
            status_code=401,
            detail="Token has been revoked",
        )
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class Credentials(BaseModel):
    fullName: Annotated[str, Field(..., min_length=2, max_length=100, description="Full Name of the User")]
    

@app.post("/credentials")
async def getCredentials(credentials:Credentials,decoded:dict=Depends(verifyToken)):
    
    db = get_db()

    uid = decoded["uid"]
    email = decoded.get("email")

    doc_ref = db.collection("Users").document(uid)
    
    snap = await doc_ref.get()

    if snap.exists:
        return JSONResponse(status_code=409,content={"message": "User Already Exists", "success": False})
    

    await doc_ref.set({
    "fullName":credentials.fullName,
    "email":email
    })
    return JSONResponse(status_code=201,content={"message":"User Created Sucessfully","success":True,"data":{"fullName": credentials.fullName,"email": email,"uid": uid,"docPath": doc_ref.path,}})
   
    