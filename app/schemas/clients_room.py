from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date, time


class HotelRoomCreate(BaseModel):
    pass

class HotelRoomUpdate(BaseModel):
    id:str
    id_hotel_reservation: str
    room_composition_id: str
    id_days: str
    id_room: int
    room_number: str
    check_in_date: datetime
    departure_date: datetime
    price: float
    currency: str
    complement: Optional[float]
    complement_currency: Optional[str]
    status: str
    comments: Optional[str]
    separatedClients: Optional[List[str]]  = None
    newClients: Optional[List[str]]  = None


