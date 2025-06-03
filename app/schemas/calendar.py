from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CalendarEvent(BaseModel):
    id: str
    type: str
    title: str
    start: str
    end: str
    color: str
    extendedProps: dict


class CalendarActivity(BaseModel):
    id: str
    title: str
    start: datetime
    end:   datetime
    city:  Optional[str] = None
    guide: Optional[str] = None
    comments: Optional[str] = None
    pax:   Optional[int] = None