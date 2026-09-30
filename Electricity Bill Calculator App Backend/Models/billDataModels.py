# Models/billDataModel.py
from typing import Annotated, List, Literal

from pydantic import BaseModel, Field


class Readings(BaseModel):
    month: Annotated[str, Field(..., description="Reading Month")]
    units: Annotated[int, Field(..., description="Month Units Consumed", gt=-1)]
    bill: Annotated[int, Field(..., description="Month Bill")]


class BillData(BaseModel):
    consumerName: Annotated[str, Field(..., description="Consumer Name", min_length=2)]
    disco: Annotated[
        Literal[
            "IESCO", "LESCO", "PESCO", "GEPCO", "FESCO",
            "MEPCO", "HESCO", "SEPCO", "QESCO",
            "K-Electric", "TESCO", "HAZECO",
        ],
        Field(..., description="User Electricity Provider Disco"),
    ]
    status: Annotated[
        Literal["Protected", "Not Protected", "Lifeline"],
        Field(..., description="User Electricity Bill Status"),
    ]
    meterPhase: Annotated[
        Literal["Single Phase", "Three Phase"],
        Field(..., description="User Electricity Meter Phase"),
    ]
    unitsPresentReading: Annotated[
        int, Field(..., gt=0, description="Current Meter Units Reading")
    ]
    readingDate: Annotated[
        int, Field(..., description="Reading Date of meter", gt=0, lt=32)
    ]
    billingHistory: Annotated[
        List[Readings], Field(..., description="Consumer Billing History")
    ]


class CurrentBillDetails(BaseModel):
    month: str
    units: int
    bill: int


class GeminiBillResponse(BaseModel):
    
    success: bool
    message: str
    consumerName: str | None = None
    currentBillDetails: CurrentBillDetails | None = None
    readingDate: int | None = None
    unitsPresentReading: int | None = None
    previousReadings: List[Readings] = Field(default_factory=list)