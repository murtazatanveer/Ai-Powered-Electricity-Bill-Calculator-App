from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import joblib

import pandas as pd

from Configuration.config import settings
from Configuration.firestore_client import get_db, close_db
from Configuration.firebase_client import get_firebase_app
from TariffDataExtraction.tariffDataScheduler import scheduler,registerJobs
from Models.mlInputModel import ModelInput

from Routes import billDataRoutes
from Routes import credentialsRoutes
from Routes import billCalculationRoutes

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Firestore (async) ──
    get_db()
    print(f"✅ Firestore client ready → {settings.gcp_project_id}")

    # ── Firebase Admin (sync) ──
    get_firebase_app()
    firebase_project = settings.firebase_project_id or settings.gcp_project_id
    print(f"✅ Firebase Admin ready → {firebase_project}")

    # ── Scheduler ──
    registerJobs()
    scheduler.start()
    print("✅ Scheduler started wating for the time")

    yield

    # ── Shutdown ──
    scheduler.shutdown(wait=False)
    print("🛑 Scheduler stopped")

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

app.include_router(credentialsRoutes.router)

app.include_router(billCalculationRoutes.router)

        
@app.post("/predict-bill")
def predictBill(modelInput: ModelInput):
    try:
        
        data = modelInput.model_dump()
        df = pd.DataFrame([data])

        model = joblib.load("ML_Model/electricity_bill_model.pkl")
        pred = model.predict(df)

        return {
            "message": "Model Predicted Successfully",
            "success": True,
            "prediction": float(pred[0]),
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"Internal Server Error: {e}", "success": False},
        )

