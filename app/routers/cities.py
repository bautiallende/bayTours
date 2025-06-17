"""Cities API router.

Todos los endpoints delegan en `app.service.cities` y usan **AsyncSession** via
dependencia `get_async_session`.
"""

from __future__ import annotations

from typing import List, Sequence

from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from ..schemas.cities import CityCreate, CityRead, CityUpdate
from ..service import cities as city_service
from ..dependencies import get_db  # dependencia ya existente en el proyecto

router = APIRouter(prefix="/cities", tags=["cities"])


@router.post("/", response_model=CityRead, status_code=status.HTTP_201_CREATED)
async def create_city(
    payload: CityCreate,
    db: Session = Depends(get_db),
):
    """Crea (o recupera) una ciudad.
    Devuelve 201 con el recurso completo. Si la ciudad ya existía se devuelve
    igualmente 201: el front distingue por el campo `id`.
    """
    city = await city_service.create_city(db, payload)
    return city


@router.get("/", response_model=List[CityRead])
async def list_cities(
    country: str | None = None,
    db: Session = Depends(get_db),
):
    """Lista ciudades; se puede filtrar por `?country=ES`."""
    cities: Sequence = await city_service.list_cities(db, country=country)
    return list(cities)


@router.patch("/{city_id}", response_model=CityRead)
async def update_city(
    city_id: int,
    payload: CityUpdate,
    db: Session = Depends(get_db),
):
    city = await city_service.update_city(db, city_id, payload)
    return city


@router.delete("/{city_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_city(
    city_id: int,
    db: Session = Depends(get_db),
):
    await city_service.delete_city(db, city_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
