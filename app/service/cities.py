"""Service layer for **City** resources.

Los routers llaman a estas funciones; aquí aplicamos cualquier regla de negocio
(más allá del CRUD puro).  Por ahora delegamos casi todo a
`app.crud.cities`, pero mantener esta capa facilita futuras extensiones (p.ej.
validación de permisos, auditoría, webhook, etc.).
"""

from __future__ import annotations
from fastapi import HTTPException, status

from typing import Sequence

from sqlalchemy.ext.asyncio import AsyncSession
from app.utils.geo import enrich_geo_data

from ..schemas.cities import CityCreate, CityUpdate, CityRead
from ..models.cities import City
from ..crud import cities as crud_cities

# ---------------------------------------------------------------------------

__all__ = [
    "create_city",
    "list_cities",
    "update_city",
    "delete_city",
]

# ---------------------------------------------------------------------------


async def create_city(db: AsyncSession, payload: CityCreate) -> City:  # noqa: D401
    """
    Strict mode: - si la ciudad no existe en GeoNames para el país dado,
    lanzamos HTTP 422 y no la insertamos.
    """
    # 1) Normalizar country code
    payload.country = payload.country.upper()

    # 2) Si no trae geonames_id o es 0 ⇒ enrich
    if not payload.geonames_id:
        geo = enrich_geo_data(payload.name, payload.country)
        if geo["geonames_id"] is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"City '{payload.name}' not found in country '{payload.country}'."
            )
        # Rellenamos los datos que el front NO necesita pasar
        payload.geonames_id = geo["geonames_id"]

    # 3) Llamar al CRUD (este hará la deduplicación)
    city = await crud_cities.get_or_create_city(db, payload)

    return CityRead.model_validate(city, from_attributes=True)


async def list_cities(db: AsyncSession, country: str | None = None) -> Sequence[City]:
    """Return all cities, optionally filtered by ISO country code."""
    return await crud_cities.list_cities(db, country=country)

async def get_city_by_name(db:AsyncSession, name: str):
    return await crud_cities.get_city_id(db, name)

async def update_city(db: AsyncSession, city_id: int, payload: CityUpdate) -> City:
    """Partial update of a city by ID."""
    return await crud_cities.update_city(db, city_id, payload)


async def delete_city(db: AsyncSession, city_id: int) -> None:
    """Delete a city by ID (cascades may apply)."""
    await crud_cities.delete_city(db, city_id)
