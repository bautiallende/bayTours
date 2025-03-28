from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class PeriodAllocation(BaseModel):
    id_guide:int
    start_date:date
    end_date: date
    id_group:str
    reason:str