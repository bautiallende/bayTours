from sqlalchemy.ext.asyncio import AsyncSession
from .group_handler import groups_handlers
import pandas as pd
from app.crud import group as group_function


async def new_group(db:AsyncSession, id_group:str, pax:int, circuit_name:str, flight_data: dict|None = None):
    handler = groups_handlers.get('new_group')

    response = await handler(db=db, id_group=id_group, flight_data=flight_data, pax=pax, circuit_name=circuit_name)

    return response


async def get_group(db:AsyncSession, id_group:str):
    response = await group_function.get_group(db=db, id_group=id_group)
    return response 


async def get_tabla_groups(db: AsyncSession, id_grupo: str = None, bus_company: str = None, guide_name: str = None, operaciones_name: str = None, status: str = None, 
                           assistant_name: str = None, has_qr: bool = None, current_city: str = None, current_hotel: str = None, sort_by: str = None, order: str = None):
    
    handler = groups_handlers.get('tabla_groups')
    
    request = await handler(db=db, id_grupo=id_grupo, bus_company=bus_company, guide_name=guide_name, operaciones_name=operaciones_name, status=status, 
                            assistant_name=assistant_name, has_qr=has_qr, current_city=current_city, current_hotel=current_hotel, sort_by=sort_by, order=order)
    
    return request



async def get_group_filters(db: AsyncSession):
    result = await group_function.get_filter_options(db)
    return result


async def get_group_data(db: AsyncSession, id_group: str, table:str):
    handler = groups_handlers.get('group_data')
    
    request = await handler(db=db, id_group=id_group, table=table)

    return request