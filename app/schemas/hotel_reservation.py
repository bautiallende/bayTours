from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date, time

class HotelReservationCreate(BaseModel):
    id_hotel: str
    id_group: str
    start_date: date
    end_date: date
    pax: int
    created_by: str

