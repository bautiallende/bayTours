from .days_handler import day_handler
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from app.crud import days as days_functions

async def new_group(db: AsyncSession, id_group:str, arrival_date:datetime, departure_date:datetime, id_circuit:str):
    handler = day_handler.get('new_group')
    response = await handler(db=db, id_group=id_group, arrival_date=arrival_date, departure_date=departure_date, id_circuit=id_circuit)
    return response



async def get_all(db:AsyncSession, id_group:str):
    response = await days_functions.get_all(db=db, id_group=id_group)
    return response
