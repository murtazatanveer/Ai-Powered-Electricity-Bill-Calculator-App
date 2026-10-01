from typing import Annotated, List, Literal,Optional

from pydantic import BaseModel, Field

class BillCalculation(BaseModel):
    units:Annotated[int,Field(...,gt=-1,description="Enter total units consumed by the consumer, check it from the meter")]
    FPA:Annotated[Optional[float],Field(default=0,description="Enter Fuel Price Adjustment (FPA) rate per unit")]
    QTA:Annotated[Optional[float],Field(default=0,description="Enter Quarterly Tariff Adjustment (QTA) rate per unit")]

