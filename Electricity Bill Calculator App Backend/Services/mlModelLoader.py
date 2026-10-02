# Services/mlModelLoader.py
import joblib
from pathlib import Path

MODEL_PATH = "ML_Model/electricity_bill_model.pkl"

_model = None

def loadModel():
    global _model
    _model = joblib.load(MODEL_PATH)

def getModel():
    return _model