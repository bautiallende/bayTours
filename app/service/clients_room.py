from sqlalchemy.ext.asyncio import AsyncSession
from .client_room import clients_rooms_handler
from app.schemas.clients_room import HotelRoomUpdate
from app.crud import clients_room as client_rooms_functions


async def create_client_room(db:AsyncSession, client_id:str, group_id:str, room_ids_by_day:dict, new:bool = False):
    handler = clients_rooms_handler.get('new_room')
    result = await handler(db=db, client_id=client_id, group_id=group_id, room_ids_by_day=room_ids_by_day, new=new)
    return result


async def update_client_room(db:AsyncSession, client_room_data:HotelRoomUpdate):
    handler = clients_rooms_handler.get('update_room')
    result = await handler(db=db, client_room_data=client_room_data)
    return result

async def update_all(db:AsyncSession, id_group:str, id_days:str):
    handler = clients_rooms_handler.get('update_all')
    result = await handler.update_all_rooms(db=db, id_group=id_group, id_days=id_days)
    return result


async def get_solo_clients(db:AsyncSession, id_days:str):
    result = await client_rooms_functions.get_solo_clients(db=db, id_days=id_days)
    return result