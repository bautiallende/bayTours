from typing import Optional
from pydantic import BaseModel

class StageBase(BaseModel):
    stage_order: int
    ferry: bool
    # si normalizamos, en lugar de city_name: city_id: int
    city_name: str  

class StageCreate(StageBase):
    pass

class StageUpdate(BaseModel):
    stage_order: Optional[int]
    ferry: Optional[bool]
    city_name: Optional[str]

class StageRead(StageBase):
    id_stage: int
    class Config:
        from_attributes = True