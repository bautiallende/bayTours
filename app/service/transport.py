from sqlalchemy.ext.asyncio import AsyncSession
from app.crud import transport as transport_functions
from .transport_handler import transport_handlers



async def create(db:AsyncSession, source:str):
    handler = transport_handlers.get(source)
    if handler:
        response = await handler.create(db)
    else:
        response = None
    return response

async def update_transport(db:AsyncSession, id_group:str, company_id:int, bus_code:str):
    handler = transport_handlers.get('update_bus')
    response = await handler(db=db, id_group=id_group, company_id=company_id, bus_code=bus_code)
    return response



async def get_transport(db: AsyncSession, id_group: str):
    result = await transport_functions.get_transport_by_group_id(db=db, id_group=id_group)
    return result