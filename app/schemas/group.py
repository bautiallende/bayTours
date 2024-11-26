from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class GroupBase(BaseModel):
    id_guide: Optional[int] = None
    id_transport: Optional[int] = None
    id_assistant: Optional[int] = None
    assistant_id_2: Optional[int] = None
    id_operations: Optional[int] = None
    id_responsible: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    initial_flight: Optional[str] = None
    end_flight: Optional[str] = None
    IGA_circuit: Optional[str] = None
    IGA_option: Optional[str] = None
    PAX: Optional[int] = None
    QR: Optional[int] = None

class GroupCreate(GroupBase):
    id_group: str

class Group(GroupBase):
    id_group: str

    class Config:
        from_attributes = True
