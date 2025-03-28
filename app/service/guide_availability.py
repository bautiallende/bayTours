from sqlalchemy.ext.asyncio import AsyncSession
from app.models.guide_availability import GuideAvailability
from app.schemas.guide_availability import PeriodAllocation
from .guide_availability_handler import availability_handler
from datetime import date
from app.crud import guides_availability as guide_availability_functions


async def update_guide_availability(db:AsyncSession, slot:PeriodAllocation):
    handler = availability_handler.get('create_slot')
    result = await handler(db=db, slot=slot)
    return result


async def get_guides_dispo(starting_date:date, ending_date:date, db:AsyncSession):
    result = await guide_availability_functions.get_available_guides(starting_date, ending_date, db)
    return result



async def delete_slot(db:AsyncSession, id_guide:int, id_group:str):
    handler = availability_handler.get('delete_slot')
    result = await handler(db=db, id_guide=id_guide, id_group=id_group)
    return result