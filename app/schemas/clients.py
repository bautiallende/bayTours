from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class ClientBase(BaseModel):
    paternal_surname: Optional[str] = None
    mother_surname: Optional[str] = None
    first_name: Optional[str] = None
    second_name: Optional[str] = None
    birth_date: Optional[date] = None
    sex: Optional[str] = None
    nationality: Optional[str] = None
    passport: Optional[str] = None
    vtc_passport: Optional[datetime] = None
    phone: Optional[str] = None
    mail: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class Clients(ClientBase):
    id_clients: int

    class Config:
        from_attributes = True
