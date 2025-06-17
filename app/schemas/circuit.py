from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


class CircuitBase(BaseModel):
    """Campos comunes que comparten Create / Update / Read."""
    name: str = Field(..., max_length=255)
    description: str | None = Field(None, max_length=255)
    total_nights: int = Field(..., gt=0)

    model_config = ConfigDict(from_attributes=True)

class CircuitCreate(CircuitBase):
    created_by: str = Field(..., max_length=250)

class CircuitUpdate(BaseModel):
    name: str | None = Field(None, max_length=255)
    description: str | None = Field(None, max_length=255)
    total_nights: int | None = Field(None, gt=0)
    updated_by: str = Field(..., max_length=250)

    model_config = ConfigDict(from_attributes=True)

class CircuitRead(CircuitBase):
    id: int
    created_at: datetime
    updated_at: datetime
    updated_by: str | None

    model_config = ConfigDict(from_attributes=True)


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