from __future__ import annotations

from enum import Enum
from datetime import date, time, datetime
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


# ────────────────────────────────────────────────────────────────
# ENUM del estado de la actividad opcional
# ────────────────────────────────────────────────────────────────
class StatusOptional(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"


# ────────────────────────────────────────────────────────────────
# BASE
# ────────────────────────────────────────────────────────────────
class ActivityBase(BaseModel):
    id_days: str = Field(..., description="FK al día (days.id)")
    id_optional: int = Field(..., description="FK a optionals.id")

    time: time | None
    duration: int | None = Field(None, ge=0, description="Duración en horas")
    pax: int | None = Field(None, ge=0, alias="PAX")
    reservation_n: str | None = Field(None, max_length=255)
    comment: str | None = Field(None, max_length=500)

    status_optional: StatusOptional = StatusOptional.pending

    id_local_guide: int | None = Field(
        None, description="FK a local_guides.id_local_guide"
    )

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


# ────────────────────────────────────────────────────────────────
# CREATE (POST)
# ────────────────────────────────────────────────────────────────
class ActivityCreate(ActivityBase):
    created_by: str = Field(..., max_length=255)


# ────────────────────────────────────────────────────────────────
# UPDATE (PATCH)
# ────────────────────────────────────────────────────────────────
class ActivityUpdate(BaseModel):
    id_days: str | None = Field(
        None, description="Mover la actividad a otro día (FK days.id)"
    )
    id_optional: int 
    time: time | None
    duration: int | None = Field(None, ge=0)
    pax: int | None = Field(None, ge=0, alias="PAX")
    reservation_n: str | None = Field(None, max_length=255)
    comment: str | None = Field(None, max_length=500)
    status_optional: StatusOptional | None = None
    id_local_guide: int | None = None
    updated_by: str = Field(..., max_length=255)

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


# ────────────────────────────────────────────────────────────────
# READ (respuesta)
# ────────────────────────────────────────────────────────────────
class ActivityRead(ActivityBase):
    id: str
    date: date  # lo tomamos del Days relacionado
    created_at: datetime
    updated_at: datetime
    updated_by: str | None

    model_config = ConfigDict(from_attributes=True)