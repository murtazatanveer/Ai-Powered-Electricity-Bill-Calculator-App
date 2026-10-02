# main.py
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from Configuration.config import settings
from Configuration.firestore_client import get_db, close_db
from Configuration.firebase_client import get_firebase_app
from TariffDataExtraction.tariffDataScheduler import scheduler, registerJobs
from Services.mlModelLoader import loadModel

from Routes import billDataRoutes
from Routes import credentialsRoutes
from Routes import billCalculationRoutes
from Routes import predictionRoutes


# Logging configuration (must be set before other imports run)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  —  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# Lifespan — startup / shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Firestore (async) ──
    get_db()
    logger.info("✅ Firestore client ready → %s", settings.gcp_project_id)

    # ── Firebase Admin (sync) ──
    get_firebase_app()
    firebase_project = settings.firebase_project_id or settings.gcp_project_id
    logger.info("✅ Firebase Admin ready → %s", firebase_project)

    # ── ML model (load once) ──
    loadModel()
    logger.info("✅ ML model loaded")

    # ── Scheduler ──
    registerJobs()
    scheduler.start()
    logger.info("✅ Scheduler started, waiting for the time")

    yield

    # ── Shutdown ──
    scheduler.shutdown(wait=False)
    logger.info("🛑 Scheduler stopped")

    await close_db()
    logger.info("🔌 Firestore client closed")


# App
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


# ── Routers ──
app.include_router(billDataRoutes.router)
app.include_router(credentialsRoutes.router)
app.include_router(billCalculationRoutes.router)
app.include_router(predictionRoutes.router)