from typing import Optional
from pydantic import BaseModel, Field


class CircuitBase(BaseModel):
    name: str
    description: Optional[str]
    total_nights: int

class CircuitCreate(CircuitBase):
    pass

class CircuitUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    total_nights: Optional[int]

class CircuitRead(CircuitBase):
    id_circuit: int
    class Config:
        from_attributes = True


class StageBase(BaseModel):
    stage_order: int
    ferry: bool
    city_name: str
    country: Optional[str] = None

class StageCreate(StageBase):
    pass

class StageUpdate(BaseModel):
    stage_order: int | None = None
    ferry: bool | None = None
    city_name: str | None = None
    country: Optional[str] = None

class StageRead(StageBase):
    id_stage: int = Field(alias="id_stage")

    model_config = {
        "from_attributes": True
    }