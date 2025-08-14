from sqlalchemy.ext.asyncio import AsyncSession
import json
from datetime import datetime
from app.schemas.guide_availability import PeriodAllocation
from app.schemas.guides import GuideAvailabilityCreate, GuideAvailabilityUpdate
from .base_handler import BaseHandler
from app.models.guide_availability import GuideAvailability
from app.crud import guides_availability as guides_availability_functions

class GuidesAvailabilityHandler(BaseHandler):

    async def create_slot(self, db:AsyncSession, id_guide:int, slot:GuideAvailabilityCreate):

        slots_guide = await guides_availability_functions.list_slots(db=db, id_guide=id_guide)

        for s in slots_guide:
            if not (s.end_date >= slot.end_date <= s.start_date or s.start_date <= slot.start_date >= s.end_date):
                print(f"El slot de disponibilidad del guía ya se encuentra ocupado: {s.start_date} - {s.end_date}")
                print(f"Slot a agregar: {slot.start_date} - {slot.end_date}")
                print(f'primer bloque: {s.end_date >= slot.end_date <= s.start_date}')
                print(f'segundo bloque: { s.start_date <= slot.start_date >= s.end_date}')
            #if s.start_date <= slot.start_date <= s.end_date or s.start_date <= slot.end_date >= s.end_date:
                return "El slot de disponibilidad del guía ya se encuentra ocupado."
                #raise ValueError("El slot de disponibilidad del guía ya se encuentra ocupado.")
                
        slot_sql =  GuideAvailability(**slot.dict())
        slot_sql.id_guide = id_guide

        new_comment = None
        if slot.notes and slot.notes.strip():
            new_comment = f'({datetime.now().strftime("%d/%m/%y %H:%M")}) - {slot.notes}'
        slot_sql.notes = json.dumps([new_comment] if slot.notes and new_comment else [])

        result = await guides_availability_functions.create_slot(db=db, slot=slot_sql)
        return result
    

    async def update_slot(self, db:AsyncSession, id_availability:int, slot:GuideAvailabilityUpdate):
        result = await guides_availability_functions.update_slot(db=db, id_availability=id_availability, payload=slot)
        return result

    async def delete_slot(self, db:AsyncSession, id_availability:int):
        result = await guides_availability_functions.delete_slot(db=db, id_availability=id_availability)
        return result
