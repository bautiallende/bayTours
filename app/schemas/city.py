from pydantic import BaseModel, Field
from typing import Optional

class CityBase(BaseModel):
    name: str
    country: Optional[str] = None
    region: Optional[str] = None
    needs_bus_permit: bool = False

class CityCreate(CityBase):
    pass

class CityRead(CityBase):
    id: int = Field(alias="id")

    model_config = {
        "from_attributes": True
    }