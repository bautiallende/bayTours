from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..dependencies import get_db
from app.schemas.permit import CityPermit, CityPermitBase
from app.service import permit as city_permit_service

router = APIRouter(prefix="/permits", tags=["city-permits"])

@router.post("/cities", response_model=CityPermit, status_code=status.HTTP_201_CREATED)
async def create_city_permit(
    permit_in: CityPermitBase,
    db:Session = Depends(get_db)
):
    """
    Crea o actualiza la configuración de permisos para una ciudad.
    Si la ciudad ya existe en city_permit_requirement, se actualiza; sino, se crea.
    """
    # Invocar al service para creación/actualización
    try:
        permit = await city_permit_service.upsert_city_permit(db=db, data=permit_in)
        return permit
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error al guardar el permiso de ciudad")

@router.get("/cities", response_model=List[CityPermit])
async def list_city_permits(
    db:Session = Depends(get_db)
):
    """
    Lista todas las configuraciones de permisos de ciudad.
    """
    permits = await city_permit_service.list_city_permits(db=db)
    return permits

@router.get("/get_city_list")
async def get_city_list():

    import pycountry

    return list(pycountry.subdivisions)


@router.post("/cities_permit", response_model=CityPermit, status_code=status.HTTP_201_CREATED)
async def create_or_update_city_permit(
    payload: CityPermitBase,
    db:Session = Depends(get_db)
):
    try:
        result = await city_permit_service.upsert_city_permit(db=db, data=payload)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

