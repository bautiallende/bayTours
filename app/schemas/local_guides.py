from __future__ import annotations
from datetime import datetime, date
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, ConfigDict


# ────────────────────────────────────────────────
# 1.  Enum para “tipo de día”
# ────────────────────────────────────────────────
class DayType(str, Enum):
    any     = "any"
    weekday = "weekday"
    weekend = "weekend"
    holiday = "holiday"


# ────────────────────────────────────────────────
# 2.  Tariff schemas
# ────────────────────────────────────────────────
class LocalGuideTariffBase(BaseModel):
    id_optional: int | None = Field(
        None, description="FK a optionals.id. NULL = tarifa genérica"
    )
    pax_min: int = Field(ge=1, default=1)
    pax_max: int | None = Field(None, ge=1)
    day_type: DayType = DayType.any
    price: float = Field(gt=0)
    currency: str = Field("EUR", min_length=3, max_length=3)
    valid_from: date | None = None
    valid_to: date | None = None
    notes: str | None = Field(None, max_length=255)

    model_config = ConfigDict(from_attributes=True)


class LocalGuideTariffCreate(LocalGuideTariffBase):
    pass


class LocalGuideTariffRead(LocalGuideTariffBase):
    id_tariff: int
    created_at: datetime
    updated_at: datetime
    updated_by: str | None


# ────────────────────────────────────────────────
# 3.  Guide schemas
# ────────────────────────────────────────────────
class LocalGuideBase(BaseModel):
    name: str
    surname: str
    phone: str
    mail: str
    id_city: int = Field(..., description="FK a cities.id")
    active: bool = True
    comments: str | None = Field(None, max_length=255)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    updated_by: str = Field(..., description="Usuario que actualiza")
    payment_method: str | None = Field(None, description="Método de pago preferido")

    model_config = ConfigDict(from_attributes=True)


class LocalGuideCreate(LocalGuideBase):
    updated_by: str
    tariffs: List[LocalGuideTariffCreate] | None = None   # ← tarifas anidadas


class LocalGuideUpdate(LocalGuideBase):
    updated_by: str
    tariffs: List[LocalGuideTariffCreate] | None = None   # reemplaza tarifario completo


class LocalGuideRead(LocalGuideBase):
    id_local_guide: int
    created_at: datetime
    updated_at: datetime
    updated_by: str | None
    tariffs: List[LocalGuideTariffRead] = []



class LocalGuideFilter(BaseModel):
    surname: Optional[str] = Field(None, description="Empieza por… (case-insensitive)")
    payment_method: Optional[str] = None          # si lo usas en tu modelo
    active: Optional[bool] = None
    id_optionals: Optional[List[int]] = None      # lista de IDs
    day_type: Optional[DayType] = None
    currency: Optional[str] = None
    pax_min: Optional[int] = None
    pax_max: Optional[int] = None
    price_min: Optional[float] = None
    price_max: Optional[float] = None