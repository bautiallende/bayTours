from sqlalchemy.ext.asyncio import AsyncSession
from .group_handler import groups_handlers
import pandas as pd
from app.crud import group as group_function


async def new_group(db:AsyncSession, id_group:str, pax:int, circuit_name:str, flight_data: dict|None = None):
    handler = groups_handlers.get('new_group')

    response = await handler(db=db, id_group=id_group, flight_data=flight_data, pax=pax, circuit_name=circuit_name)

    return response


async def update_guide(db:AsyncSession, id_group:str, id_guide:int):
    handler = groups_handlers.get('update_guide')
    response = await handler(db=db, id_group=id_group, id_guide=id_guide)
    return response


async def update_operations(db:AsyncSession, id_group:str, id_operations:str):
    handler = groups_handlers.get('set_operations')
    response = await handler(db=db, id_group=id_group, id_operations=id_operations)
    return response
    

async def update_assistant(db:AsyncSession, id_group:str, id_assistant:str):
    handler = groups_handlers.get('set_assistant')
    response = await handler(db=db, id_group=id_group, id_assistant=id_assistant)
    return response


async def update_responsable_hotel(db:AsyncSession, id_group:str, id_responsible_hotels:str):
    handler = groups_handlers.get('set_responsable_hotel')
    response = await handler(db=db, id_group=id_group, id_responsible_hotels=id_responsible_hotels)
    return response


async def update_qr(db:AsyncSession, id_group:str, has_qr:bool):
    handler = groups_handlers.get('set_qr')
    response = await handler(db=db, id_group=id_group, has_qr=has_qr)
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