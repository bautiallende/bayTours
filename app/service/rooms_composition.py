from sqlalchemy.ext.asyncio import AsyncSession
from app.models.rooms_composition import RoomsComposition
from .rooms_composition_handler import room_handler
from app.crud import room_composition as room_composition_functions


async def create(db:AsyncSession, room_data:RoomsComposition):
    handler = room_handler.get('create')

    if handler:
        response = await handler.create(db=db, room_data=room_data)
        return response
    else:
        return None  
    


async def get_clients_by_id(db: AsyncSession, room_composition_id:str):
    result = await room_composition_functions.get_clients_by_id(db=db, room_composition_id=room_composition_id)
    return result
