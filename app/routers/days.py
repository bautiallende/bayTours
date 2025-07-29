from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..dependencies import get_db
from app.service import days as days_service
from app.service import cities as cities_service



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


@router.get('/get_day_id')
async def get_day_id(id_group:str ,db:Session = Depends(get_db)):
    from app.crud.days import get_day_id
    response = await  get_day_id(db=db, id_group=id_group)
    if not response:
        raise HTTPException(status_code=404, detail="No hay día para este grupo")
    return response


@router.get('/get_days_by_group_and_date')
async def get_days_by_group_and_date(
    id_group: str,
    date: str,
    db: Session = Depends(get_db)
):
    """
    Obtiene los días asociados a un grupo y una fecha específica.
    """
    response = await days_service.get_date_by_group_and_date(db=db, id_group=id_group, date=date)

    print(response.__dict__)
    city =  await cities_service.get_city_by_name(db=db, name=response.city)

    print(city)    
    if not response:
        raise HTTPException(status_code=404, detail="No se encontraron días para el grupo y la fecha especificados")
    
    return response
