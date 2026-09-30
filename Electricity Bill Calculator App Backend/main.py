from contextlib import asynccontextmanager
from fastapi import FastAPI,Depends
from fastapi.responses import JSONResponse


from Configuration.config import settings
from Configuration.firestore_client import get_db, close_db
from Configuration.firebase_client import get_firebase_app
from Dependencies.verifyAuthToken import verifyToken
from Routes import billDataRoutes
from Models.credentialsModels import Credentials



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

app.include_router(billDataRoutes.router)


@app.post("/add-credentials")
async def setCredentials(credentials:Credentials,decoded:dict=Depends(verifyToken)):
    
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
