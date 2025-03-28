from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json
from ..dependencies import get_db
from app.service import transport as transport_service
from app.service import transport_company as transport_company_service

router = APIRouter(
    prefix="/rooms",
    tags=["rooms"],
)

@router.put("/")
async def get_rooms(id_days:List[str], db:Session = Depends(get_db), filters:str=None):
    filters_dict = None
    if filters:
        filters_dict = json.loads(filters)
    from app.crud.clients_room import get_room_by_id_group_and_city
    rooms = await get_room_by_id_group_and_city(db=db, id_days=id_days, filters=filters_dict)
    if not rooms:
        raise HTTPException(status_code=404, detail="Rooms not found")
    return rooms


@router.get("/city")
async def get_city_by_day_id(id_days:str, db:Session = Depends(get_db)):
    from app.crud.clients_room import get_city_by_id
    rooms = await get_city_by_id(db=db, id_day=id_days)
    if not rooms:
        raise HTTPException(status_code=404, detail="Rooms not found")
    return rooms


@router.get("/room")
async def get_room_by_id_day(id_days:str, db:Session = Depends(get_db)):
    from app.crud.clients_room import get_room_by_id_day
    rooms = await get_room_by_id_day(db=db, id_day=id_days)
    if not rooms:
        raise HTTPException(status_code=404, detail="Rooms not found")
    return rooms