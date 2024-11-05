from pydantic import BaseModel
from typing import Optional
from datetime import datetime

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


