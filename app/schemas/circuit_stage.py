from datetime import datetime, time
from typing import List

from pydantic import BaseModel, Field, ConfigDict


# ────────────────────────────────────────────────────────────────
# STAGE-TRANSPORTS
# ────────────────────────────────────────────────────────────────
class StageTransportBase(BaseModel):
    mode: str = Field(..., max_length=20)  # "bus", "ferry", "train", …
    operator_name: str | None = Field(None, max_length=100)
    reference_code: str | None = Field(None, max_length=50)
    notes: str | None = Field(None, max_length=255)

    model_config = ConfigDict(from_attributes=True)


class StageTransportCreate(StageTransportBase):
    """Payload de entrada anidado dentro de CircuitStageCreate."""
    pass


class StageTransportRead(StageTransportBase):
    id_transport: int
    created_at: datetime
    updated_at: datetime
    updated_by: str | None
    depart_time: time | None



# ────────────────────────────────────────────────────────────────
# CIRCUIT-STAGES
# ────────────────────────────────────────────────────────────────
class CircuitStageBase(BaseModel):
    stage_order: int = Field(..., ge=1)        # Día N dentro del circuito
    city_id: int                               # FK a tabla cities

    model_config = ConfigDict(from_attributes=True)


class CircuitStageCreate(CircuitStageBase):
    """
    Se envía dentro de un endpoint `/circuits/{id}/stages`
    o bien como parte de otro flujo batch.
    """
    transports: List[StageTransportCreate] | None = None
    created_by: str = Field(..., max_length=250)


class CircuitStageUpdate(BaseModel):
    stage_order: int | None = Field(None, ge=1)
    city_id: int | None = None
    transports: List[StageTransportCreate] | None = None  # reemplaza la lista
    updated_by: str = Field(..., max_length=250)

    model_config = ConfigDict(from_attributes=True)


class CircuitStageRead(CircuitStageBase):
    id_stage: int
    id_circuit: int
    transports: List[StageTransportRead] = []
    created_at: datetime
    updated_at: datetime
    updated_by: str | None
    city_name: str