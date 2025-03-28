from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.guide_availability import PeriodAllocation
from .base_handler import BaseHandler
from app.models.guide_availability import GuideAvailability
from app.crud import guides_availability as guides_availability_functions

class GuidesAvailabilityHandler(BaseHandler):

    async def create_slot(self, db:AsyncSession, slot:PeriodAllocation):

        slots_guide = await guides_availability_functions.get_slots(db=db, id_guide=slot.id_guide)

        for s in slots_guide:
            if s.start_date <= slot.start_date <= s.end_date or s.start_date <= slot.end_date <= s.end_date:
                return "El slot de disponibilidad del guía ya se encuentra ocupado."
                #raise ValueError("El slot de disponibilidad del guía ya se encuentra ocupado.")
                
        slot_sql =  GuideAvailability(**slot.dict())

        result = await guides_availability_functions.create(db=db, slot=slot_sql)
        return result
    

    async def delete_slot(self, db:AsyncSession, id_group:str, id_guide:int):
        result = await guides_availability_functions.delete_slot(db=db, id_group=id_group, id_guide=id_guide)
        return result
