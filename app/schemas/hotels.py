from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class HotelRoomType(str, Enum):
    SGL = 'SGL'
    DBL = 'DBL'
    TWIN = 'TWIN'
    DBL_C_MNR = 'DBL C/MNR'
    TPL = 'TPL'
    TPL_C_MNR = 'TPL C/MNR'



class HotelBase(BaseModel):
    id_hotel: int
    hotel_name: str
    country: str
    city: str
    address: str 
    phone_1: str
    phone_2: str
    phone_3: str 
    mail_1: str 
    mail_2: str 
    mail_3: str 
    agreements: str 
    payment_method: str 


