from __future__ import annotations

from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, Field, ConfigDict


# ────────────────────────────────────────────────────────────────
# ENUM del estado del permiso
# ────────────────────────────────────────────────────────────────
class PermitStatus(str, Enum):
    pending = "pending"
    submitted = "submitted"
    approved = "approved"
    rejected = "rejected"


# ────────────────────────────────────────────────────────────────
# BASE – campos comunes a todos los modelos
# ────────────────────────────────────────────────────────────────
class GroupCityPermitBase(BaseModel):
    id_permit: str
    id_group: str
    id_city: int
    id_transport: str

    valid_from: date
    valid_to: date

    status: PermitStatus = PermitStatus.pending

    permit_number: str | None = Field(None, max_length=255)
    managed_by: str | None = Field(None, max_length=255)
    provider: str | None = Field(None, max_length=255)
    price: float | None = None
    payed_with: str | None = Field(None, max_length=255)
    payment_date: date | None = None
    comments: str | None = Field(None, max_length=500)

    model_config = ConfigDict(from_attributes=True)


# ────────────────────────────────────────────────────────────────
# CREATE – payload de entrada
# (Operaciones podría crear uno “manual”; el sistema lo usará para auto-crear)
# ────────────────────────────────────────────────────────────────
class GroupCityPermitCreate(GroupCityPermitBase):
    updated_by: str = Field(..., max_length=255)


# ────────────────────────────────────────────────────────────────
# UPDATE – payload parcial
# ────────────────────────────────────────────────────────────────
class GroupCityPermitUpdate(BaseModel):
    valid_from: date | None = None
    valid_to: date | None = None
    status: PermitStatus | None = None

    permit_number: str | None = Field(None, max_length=255)
    managed_by: str | None = Field(None, max_length=255)
    provider: str | None = Field(None, max_length=255)
    price: float | None = None
    payed_with: str | None = Field(None, max_length=255)
    payment_date: date | None = None
    comments: str | None = Field(None, max_length=500)

    updated_by: str = Field(..., max_length=255)

    model_config = ConfigDict(from_attributes=True)


# ────────────────────────────────────────────────────────────────
# READ – respuesta hacia el front
# ────────────────────────────────────────────────────────────────
class GroupCityPermitRead(GroupCityPermitBase):
    id_permit: str
    created_at: datetime
    updated_at: datetime
    updated_by: str | None
    city_name: str | None = None

    model_config = ConfigDict(from_attributes=True)