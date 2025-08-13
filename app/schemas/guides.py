from __future__ import annotations
from datetime import date, datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, ConfigDict


# ───── Enums ────────────────────────────────────────────────────
class ContractType(str, Enum):
    staff = "staff"
    third_party = "third_party"


class AvailabilityStatus(str, Enum):
    free = "free"
    tentative = "tentative"
    confirmed = "confirmed"
    unavailable = "unavailable"
    vacation = "vacation"


class EvaluationSource(str, Enum):
    ops = "ops"
    assistant = "assistant"
    client = "client"


# ───── Availability schemas ────────────────────────────────────
class GuideAvailabilityBase(BaseModel):
    start_date: date
    end_date: date
    status: AvailabilityStatus = AvailabilityStatus.free
    id_group: str | None = None
    notes: str | None = Field(None, max_length=255)

    model_config = ConfigDict(from_attributes=True)


class GuideAvailabilityCreate(GuideAvailabilityBase):
    modified_by: str


class GuideAvailabilityUpdate(GuideAvailabilityCreate):
    id_availability: int | None = None


class GuideAvailabilityRead(GuideAvailabilityBase):
    id_availability: int
    modified_at: datetime
    modified_by: str
    circuit_id: int | None = None
    circuit_name: str | None = None


# ───── Evaluation schemas ───────────────────────────────────────
class GuideEvaluationBase(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str | None = None
    source: EvaluationSource = EvaluationSource.ops

    model_config = ConfigDict(from_attributes=True)


class GuideEvaluationCreate(GuideEvaluationBase):
    created_by: str
    id_group: str | None = None


class GuideEvaluationRead(GuideEvaluationBase):
    id_eval: int
    id_group: str | None = None
    created_at: datetime
    created_by: str


class GuideEvaluationUpdate(GuideEvaluationBase):
    # NOTA: created_by/created_at no se tocan en updates
    pass



# ───── Guide schemas ────────────────────────────────────────────
class GuideBase(BaseModel):
    name: str
    surname: str
    phone: str
    mail: str
    birth_date: date
    id_city: int
    nationality: str | None = None
    languages: List[str] = []
    passport_number: str | None = None
    passport_expiry: date | None = None
    license_number: str | None = None
    license_expiry: date | None = None
    contract_type: ContractType = ContractType.third_party
    daily_rate: float
    currency: str = "EUR"
    commission_onsite: float = 0
    commission_pretour: float = 0
    comment: str | None = None
    active: bool = True
    photo_url: str | None = None

    model_config = ConfigDict(from_attributes=True)


class GuideCreate(GuideBase):
    updated_by: str
    availability: List[GuideAvailabilityUpdate] | None = None


class GuideUpdate(GuideBase):
    updated_by: str
    availability: List[GuideAvailabilityUpdate] | None = None


class GuideRead(GuideBase):
    id_guide: int
    created_at: datetime
    updated_at: datetime
    updated_by: str | None
    city_name: str | None = None
    availability: List[GuideAvailabilityRead] = []
    evaluations: List[GuideEvaluationRead] = []
    



