# Models/predictionModel.py
from typing import Annotated, Literal, Optional

from pydantic import BaseModel, Field


class ModelInput(BaseModel):
    Area_Type: Annotated[
        Literal["Urban", "Semi-Urban", "Rural"],
        Field(..., description="Enter Your Area Type"),
    ]
    Household_Size: Annotated[int, Field(..., description="Household Size", gt=0)]
    Rooms: Annotated[int, Field(..., description="Number of rooms", gt=0, lt=50)]
    AC_Units: Annotated[int, Field(..., description="Number of AC units", gt=-1)]
    Fan_Count: Annotated[int, Field(..., description="Number of fans", gt=0)]
    Light_Count: Annotated[int, Field(..., description="Number of lights", gt=0)]
    Refrigerator: Annotated[
        Literal[0, 1], Field(..., description="Has refrigerator? 1=Yes, 0=No"),
    ]
    TV_Count: Annotated[int, Field(..., description="Number of TVs", gt=-1)]
    Washing_Machine: Annotated[
        Literal[0, 1], Field(..., description="Has washing machine? 1=Yes, 0=No"),
    ]
    Other_Appliances: Annotated[int, Field(..., description="Other appliances", gt=-1)]
    Temperature_C: Annotated[float, Field(..., description="Temperature (°C)", gt=8)]
    Tariff_Category: Annotated[
        Literal["Residential", "Residential-Lifeline"],
        Field(..., description="Tariff category"),
    ]

    # Optional — used in the downstream bill calculation
    FPA: Annotated[
        Optional[float],
        Field(default=0, description="Fuel Price Adjustment (per unit)"),
    ]
    QTA: Annotated[
        Optional[float],
        Field(default=0, description="Quarterly Tariff Adjustment (per unit)"),
    ]

class ModelInputUpdate(BaseModel):
    Area_Type: Annotated[
       Optional[Literal["Urban", "Semi-Urban", "Rural"]],
        Field(description="Enter Your Area Type",default="Urban"),
    ]
    Household_Size: Annotated[Optional[int], Field(default=2, description="Household Size", gt=0)]
    Rooms: Annotated[Optional[int], Field(default=5,description="Number of rooms", gt=0, lt=50)]
    AC_Units: Annotated[Optional[int], Field(default=0, description="Number of AC units", gt=-1)]
    Fan_Count: Annotated[Optional[int], Field(default=3, description="Number of fans", gt=0)]
    Light_Count: Annotated[Optional[int], Field(default=3, description="Number of lights", gt=0)]
    Refrigerator: Annotated[
        Optional[Literal[0, 1]], Field(default=0, description="Has refrigerator? 1=Yes, 0=No"),
    ]
    TV_Count: Annotated[Optional[int], Field(default=0, description="Number of TVs", gt=-1)]
    Washing_Machine: Annotated[
        Optional[Literal[0, 1]], Field(default=0, description="Has washing machine? 1=Yes, 0=No"),
    ]
    Other_Appliances: Annotated[Optional[int], Field(default=1, description="Other appliances", gt=-1)]
    Temperature_C: Annotated[Optional[float], Field(default=30, description="Temperature (°C)", gt=8)]
    Tariff_Category: Annotated[
        Optional[Literal["Residential", "Residential-Lifeline"]],
        Field(default="Residential-Lifeline", description="Tariff category"),
    ]