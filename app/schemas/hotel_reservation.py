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
    comment: Optional[str]

class HotelReservationSameDay(BaseModel):
    id_day:str
    id_hotel: int
    id_group: str
    start_date: date
    end_date: date
    pax: int
    currency: Optional[str]
    total_to_pay: Optional[float]
    comment: Optional[str]
    rooming_list:bool
    pro_forma:bool
    payment_date: Optional[date]
    payment_done_date: Optional[date]
    payed_by: Optional[str]
    factura: bool
    iga: bool
    updated_by: str

class HotelReservationUpdate(BaseModel):
    id:str
    id_hotel: int
    id_group: str
    start_date: date
    hour_check_in: time
    end_date: date
    hour_check_out: time
    pax: int
    currency: Optional[str]
    total_to_pay: Optional[float]
    comment: Optional[str]
    rooming_list:bool
    pro_forma:bool
    payment_date: Optional[date]
    payment_done_date: Optional[date]
    payed_by: Optional[str]
    factura: bool
    iga: bool


class CreateBaseHotel(BaseModel):
    id_group: str
    start_date: date
    end_date: date

