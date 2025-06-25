from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field, ConfigDict


class TransportMode(str, Enum):  # mismo enum que antes
    bus = "bus"
    ferry = "ferry"
    train = "train"
    flight = "flight"
    boat = "boat"
    walk = "walk"
    gondola = "gondola"
    other = "other"


class DayTransportBase(BaseModel):
    mode: TransportMode
    operator_name: str | None = Field(None, max_length=100)
    reference_code: str | None = Field(None, max_length=50)
    departure_time: datetime | None = None
    notes: str | None = Field(None, max_length=255)

    model_config = ConfigDict(from_attributes=True)


class DayTransportCreate(DayTransportBase):
    updated_by: str = Field(..., max_length=250)


class DayTransportUpdate(BaseModel):
    mode: TransportMode | None = None
    operator_name: str | None = Field(None, max_length=100)
    reference_code: str | None = Field(None, max_length=50)
    departure_time: datetime | None = None
    notes: str | None = Field(None, max_length=255)
    updated_by: str = Field(..., max_length=250)

    model_config = ConfigDict(from_attributes=True)


class DayTransportRead(DayTransportBase):
    id_transport: int
    id_day: str
    created_at: datetime
    updated_at: datetime
    updated_by: str | None