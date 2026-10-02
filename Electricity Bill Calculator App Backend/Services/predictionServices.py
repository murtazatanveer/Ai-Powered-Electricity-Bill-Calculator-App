# Services/predictionServices.py
from typing import Any

import numpy as np
import pandas as pd

from Models.mlInputModel import ModelInput
from Services.mlModelLoader import getModel
from Utils.firestoreHelpers import addDoc

Y_PERCENTILE_VALUES: list[float] = [
    1736.334,
    1988.992,
    2200.366,
    2410.494,
    2694.165,
    3033.048,
    3536.579,
    4078.590,
    4675.667,
    7683.430,
]


# 1) ML prediction
def predictBill(input: ModelInput) -> float:
    try:
        model = getModel()
        data = input.model_dump()
        df = pd.DataFrame([data])

        # Match the training-time dtypes for the string columns
        for col in ["Area_Type", "Tariff_Category"]:
            if col in df.columns:
                df[col] = df[col].astype("object")

        prediction = model.predict(df)[0]
        return float(prediction)
    except Exception as e:
        raise RuntimeError(f"Model inference failed: {e}") from e


# 2) Percentile computation over user's units
def computeUnitsPercentiles(billingHistory: list[dict]) -> list[float]:
    units = sorted(
        float(r["units"])
        for r in billingHistory
        if isinstance(r.get("units"), (int, float))
    )

    if not units:
        return []

    return [float(np.percentile(units, p)) for p in range(10, 110, 10)]


# 3) Bucket detection
def findPredictionBucket(predictedBill: float) -> int:
    for i, threshold in enumerate(Y_PERCENTILE_VALUES):
        if predictedBill <= threshold:
            return i
    return len(Y_PERCENTILE_VALUES) - 1


# 4) Quantile mapping — BDT bill → Pakistani units
def mapPredictionToUnits(
    predictedBill: float,
    billingHistory: list[dict],
) -> dict[str, Any]:
    unitsPercentiles = computeUnitsPercentiles(billingHistory)

    if len(unitsPercentiles) < 10:
        return {
            "success": False,
            "reason": "Insufficient billing history for percentile mapping.",
        }

    bucketIndex = findPredictionBucket(predictedBill)

    if bucketIndex == 0:
        mappedUnits = unitsPercentiles[0]
    else:
        low = unitsPercentiles[bucketIndex - 1]
        high = unitsPercentiles[bucketIndex]
        mappedUnits = (low + high) / 2.0

    return {
        "success": True,
        "bucketIndex": bucketIndex,
        "unitsPercentiles": unitsPercentiles,
        "mappedUnits": round(mappedUnits, 2),
    }

async def savePrediction(predictionDoc: dict) -> str:
    
    return await addDoc("Predictions", predictionDoc)