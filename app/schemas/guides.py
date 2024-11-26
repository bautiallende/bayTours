from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class GuideBase(BaseModel):
    name:str
    surname:str
    phone:str
    birth_date: datetime
    mail: str
    passaport: str
    comment:str

class Guide(GuideBase):
    id_guide: int
    active: bool = True