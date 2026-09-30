from pydantic import BaseModel,Field
from typing import Annotated

class Credentials(BaseModel):
    fullName: Annotated[str, Field(..., min_length=2, max_length=100, description="Full Name of the User")]