from __future__ import annotations

from datetime import datetime,time
from enum import Enum

from pydantic import BaseModel, Field, ConfigDict


# ────────────────────────────────────────────────────────────────
# ENUM de modos de transporte (idéntico al del modelo ORM)
# ────────────────────────────────────────────────────────────────
class TransportMode(str, Enum):
    bus = "bus"          # refuerzo local
    ferry = "ferry"
    train = "train"
    flight = "flight"
    boat = "boat"
    walk = "walk"
    gondola = "gondola"
    other = "other"


# ────────────────────────────────────────────────────────────────
# BASE  – campos compartidos
# ────────────────────────────────────────────────────────────────
class StageTransportBase(BaseModel):
    mode: TransportMode = Field(
        ...,
        description="Tipo de transporte por defecto para esa etapa."
    )
    operator_name: str | None = Field(
        None, max_length=100,
        description="Compañía operadora (opcional)."
    )
    reference_code: str | None = Field(
        None, max_length=50,
        description="Reserva / billete (opcional)."
    )
    notes: str | None = Field(None, max_length=255)
    depart_time: time | None = Field(
        None,
        description="Hora de salida del transporte (opcional)."
    )

    model_config = ConfigDict(from_attributes=True)


# ────────────────────────────────────────────────────────────────
# CREATE  – payload de entrada
# ────────────────────────────────────────────────────────────────
class StageTransportCreate(StageTransportBase):
    updated_by: str = Field(..., max_length=250)


# ────────────────────────────────────────────────────────────────
# UPDATE  – payload parcial
# ────────────────────────────────────────────────────────────────
class StageTransportUpdate(BaseModel):
    mode: TransportMode | None = None
    operator_name: str | None = Field(None, max_length=100)
    reference_code: str | None = Field(None, max_length=50)
    notes: str | None = Field(None, max_length=255)
    updated_by: str = Field(..., max_length=250)
    depart_time: time | None = None

    model_config = ConfigDict(from_attributes=True)


# ────────────────────────────────────────────────────────────────
# READ  – respuesta al front
# ────────────────────────────────────────────────────────────────
class StageTransportRead(StageTransportBase):
    id_transport: int
    id_stage: int
    created_at: datetime
    updated_at: datetime
    updated_by: str | None
    depart_time: time | None

    model_config = ConfigDict(from_attributes=True)