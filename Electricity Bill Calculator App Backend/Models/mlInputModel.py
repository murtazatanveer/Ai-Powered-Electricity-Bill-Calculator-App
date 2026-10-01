from pydantic import BaseModel,Field
from typing import Annotated,Literal

class ModelInput(BaseModel):
    Area_Type:Annotated[Literal["Urban","Semi-Urban","Rural"],Field(...,description="Enter Your Area Type",examples=["Urban","Semi-Urban","Rural"])]
    Household_Size:Annotated[int,Field(...,description="Enter Your Household Size",gt=0)]
    Rooms:Annotated[int,Field(...,description="Enter No of rooms",gt=0,lt=50)]
    AC_Units:Annotated[int,Field(...,description="Enter no of as units",gt=-1)]
    Fan_Count:Annotated[int,Field(...,description="Enter no of fans",gt=0)]
    Light_Count:Annotated[int,Field(...,description="Enter no of lights",gt=0)]
    Refrigerator:Annotated[Literal[0,1],Field(...,description="Has Refigrator ? 1:Yes , 0:No",examples=[0,1])]
    TV_Count:Annotated[int,Field(...,description="Enter no of TV's",gt=-1)]
    Washing_Machine:Annotated[int,Field(...,description="Has Washing Machine ? 1:Yes , 0:No", gt=-1,lt=2)]
    Other_Appliances:Annotated[int,Field(...,description="Enter no of Other Appliance",gt=-1)]
    Temperature_C:Annotated[float,Field(...,description="Enter Temperature",gt=8)]
    Tariff_Category:Annotated[Literal["Residential","Residential-Lifeline"],Field(...,description="Enter Your Tariff Category",examples=["Residential","Residential-Lifeline"])]




