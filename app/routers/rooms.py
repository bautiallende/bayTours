from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json
from ..dependencies import get_db
from app.service import transport as transport_service
from app.service import transport_company as transport_company_service
from app.service import rooms_composition as rooms_composition_service
from app.service import clients_room as client_room_service

router = APIRouter(
    prefix="/rooms",
    tags=["rooms"],
)

@router.put("/")
async def get_rooms(id_days:List[str], db:Session = Depends(get_db), filters:str=None):
    try:
        filters_dict = None
        if filters:
            filters_dict = json.loads(filters)
            print(f'filters_dict: {filters_dict}')
        from app.crud.clients_room import get_room_by_id_group_and_city
        rooms = await get_room_by_id_group_and_city(db=db, id_days=id_days, filters=filters_dict)
        if not rooms:
            raise HTTPException(status_code=404, detail="Rooms not found")
        return rooms
    except Exception as e:
        print(f'Error en get_rooms: {e}')
        


@router.put("/update_all")
async def update_all(id_group:str, id_days:str, db:Session = Depends(get_db)):
    from app.service.clients_room import update_all
    result = await client_room_service.update_all(db=db, id_group=id_group, id_days=id_days)
    if result != True:
        raise HTTPException(status_code=404, detail=result)
    return result


@router.get("/city")
async def get_city_by_day_id(id_days:str, db:Session = Depends(get_db)):
    from app.crud.clients_room import get_city_by_id
    rooms = await get_city_by_id(db=db, id_day=id_days)
    #if not rooms:
    #    raise HTTPException(status_code=404, detail="Rooms not found")
    return rooms


@router.get("/room")
async def get_room_by_id_day(id_days:str, db:Session = Depends(get_db)):
    from app.crud.clients_room import get_room_by_id_day
    rooms = await get_room_by_id_day(db=db, id_day=id_days)
    # if not rooms:
    #     raise HTTPException(status_code=404, detail="Rooms not found")
    return rooms


@router.get("/get_clients_by_id")
async def get_clients_by_id(room_composition_id:str, db:Session = Depends(get_db)):
    clients = await rooms_composition_service.get_clients_by_id(db=db, room_composition_id=room_composition_id)
    if not clients:
        raise HTTPException(status_code=404, detail="Clients not found")
    return {"status": "success", "data": clients}


@router.get("/get_solo_clients")
async def get_solo_clients(id_days:str, db:Session = Depends(get_db)):
    clients = await client_room_service.get_solo_clients(db=db, id_days=id_days)
    if not clients:
        raise HTTPException(status_code=404, detail="Clients not found")
    return {"status": "success", "data": clients}

    