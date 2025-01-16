from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..dependencies import get_db
from app.service import days as days_service



router = APIRouter(
    prefix="/days",
    tags=["days"],
)


@router.get('/get_days_for_filter')
async def get_days_for_filter(id_group:str, db:Session = Depends(get_db)):
    responde = await days_service.get_days_filter(db=db, id_group=id_group)

    if not responde:
        raise HTTPException(status_code=404, detail="No hay días disponibles para este grupo")
    return responde


