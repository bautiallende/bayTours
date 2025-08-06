from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi import Query
from sqlalchemy.orm import Session
from ..dependencies import get_db
from app.service import local_guides as local_guides_service
from app.schemas.local_guides import LocalGuideCreate, LocalGuideUpdate, LocalGuideRead, LocalGuideFilter
import json


router = APIRouter(
    prefix="/local_guides",
    tags=["local_guides"],
)


@router.post("/local_guide", response_model=LocalGuideRead, status_code=201)
async def create_local_guide(
    local_guide: LocalGuideCreate,
    db: Session = Depends(get_db),
):
    result = await local_guides_service.create_local_guide(
        local_guide=local_guide, db=db
    )
    return result


@router.put('/local_guide/{id_local_guide}')
async def update_local_guide(id_local_guide: int, local_guide: LocalGuideUpdate, db: Session = Depends(get_db)):
    """
    Update an existing local guide.
    """
    updated_local_guide = await local_guides_service.update_local_guide(local_guide=local_guide, db=db, id_local_guide=id_local_guide)
    if not updated_local_guide:
        raise HTTPException(status_code=404, detail="Local guide not found")
    return updated_local_guide


@router.get('/local_guides')
async def get_guides(city: int, filter: str | None = Query(None, description="JSON string con criterios de filtro "'(ver esquema LocalGuideFilter)',
    ), db:Session = Depends(get_db)):
    
    try:
        flt = LocalGuideFilter.model_validate(json.loads(filter)) if filter else LocalGuideFilter()
    except ValueError:
        raise HTTPException(422, "filter debe ser JSON válido")
    
    result = await local_guides_service.get_all(db=db, city=city, flt=flt)

    if not result:
        raise HTTPException(status_code=404, detail="No local guide found for this group")
    return result



@router.get("/get_cities")
async def get_cities(db: Session = Depends(get_db)):
    """
    Get all cities with local guides.
    """
    result = await local_guides_service.get_cities(db=db)
    
    if not result:
        raise HTTPException(status_code=404, detail="No cities found")
    
    return result


@router.get("/get_countries")
async def get_countries(db: Session = Depends(get_db)):
    """
    Get all countries with local guides.
    """
    result = await local_guides_service.get_countries(db=db)
    
    if not result:
        raise HTTPException(status_code=404, detail="No countries found")
    
    return result


@router.get("/local_guides/{id_local_guide}", response_model=LocalGuideRead)
async def get_local_guide_endpoint(
    id_local_guide: int,
    db: Session = Depends(get_db),
):
    """
    Devuelve la ficha completa del guía local **incluyendo su tarifario**.
    """
    return await local_guides_service.get_local_guide_full(db=db, id_local_guide=id_local_guide)