import pandas as pd;
import numpy as np;
import joblib

dataset = pd.read_csv('Electricity_Bill_Prediction.csv');

from sklearn.model_selection import train_test_split;

x_train , x_test , y_train , y_test = train_test_split(dataset.iloc[:,:-1], dataset.iloc[:,-1], test_size=0.2, random_state=42);


from sklearn.preprocessing import StandardScaler;
from sklearn.compose import ColumnTransformer;
from sklearn.preprocessing import OneHotEncoder;
from sklearn.pipeline import Pipeline

numeric_columns = [
    "Household_Size",
    "Rooms",
    "Fan_Count",
    "Light_Count",
    "TV_Count",
    "Other_Appliances",
    "Temperature_C"
]

categorical_columns = [
    "Area_Type",
    "Tariff_Category"
]

ct = ColumnTransformer(

    transformers=[
        ("Scaler", StandardScaler(), numeric_columns),
        ("OHE", OneHotEncoder(drop='first'), categorical_columns)
    ],
    remainder="passthrough"
);

from xgboost import XGBRegressor

regressor=XGBRegressor(max_depth=2,gamma=0.7,n_estimators=50)

pipe = Pipeline([
    ("ct",ct),
     ("regressor",regressor)
     ]);

pipe.fit(x_train,y_train);

# 6) Save — ensure directory exists
import os
os.makedirs("ML_Model", exist_ok=True)
joblib.dump(pipe, "ML_Model/electricity_bill_model.pkl")
print("✅ Model saved")


# 7) Immediate verification — load it back
loaded = joblib.load("ML_Model/electricity_bill_model.pkl")
test_pred = loaded.predict(x_test.iloc[[0]])
print(f"Verification prediction: {test_pred[0]}")


# Build the row the SAME way the endpoint does
data = {
    "Area_Type": "Urban",
    "Household_Size": 7,
    "Rooms": 6,
    "AC_Units": 1,
    "Fan_Count": 9,
    "Light_Count": 15,
    "Refrigerator": 1,
    "TV_Count": 2,
    "Washing_Machine": 0,
    "Other_Appliances": 3,
    "Temperature_C": 29.3,
    "Tariff_Category": "Residential",
}

df_manual = pd.DataFrame([data])

print("=== MANUAL ROW (endpoint-style) ===")
print("Dtypes:")
print(df_manual.dtypes)
print()
print("Values:")
print(df_manual.values)
print()
print("Prediction:", pipe.predict(df_manual)[0])
print()

# Now compare with the x_test row
x_test_row = x_test.iloc[[100], :]

print("=== X_TEST ROW ===")
print("Dtypes:")
print(x_test_row.dtypes)
print()
print("Values:")
print(x_test_row.values)
print()
print("Prediction:", loaded.predict(x_test_row)[0])