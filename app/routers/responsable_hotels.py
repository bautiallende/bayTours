from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..dependencies import get_db
from app.service import responsable_hoteles as responsable_hoteles_service
from app.service import group as group_service

router = APIRouter(
    prefix="/responsable_hotels",
    tags=["responsable_hotels"],
)


@router.get('/get_responsable_hotels')
async def get_responsable_hotels(id_group:str, db:Session=Depends(get_db)):

    group_data = await group_service.get_group(db=db, id_group=id_group)

    responsable_hotels = await responsable_hoteles_service.get_responsable_hoteles(db=db)

    if group_data.id_responsible_hotels:
        responsable_hotels = [hotel for hotel in responsable_hotels if hotel.id_responsible_hotels != group_data.id_responsible_hotels]
    else:
        responsable_hotels = responsable_hotels

    return responsable_hotels