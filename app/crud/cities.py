"""CRUD helpers for the **City** model (async façade).

Las funciones pasan a ser `async def` porque el proyecto usa **AsyncSession**.
Por ahora, los llamados internos siguen en estilo "sync" (`db.add`, `db.commit`,
`db.refresh`) tal como está en el resto del servicio. En el futuro bastará con
cambiar esos métodos a `await db.<method>()`.
"""

from __future__ import annotations

from datetime import datetime
from typing import Iterable, Sequence

from rapidfuzz import fuzz
from sqlalchemy import Select, select, update, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.cities import City
from ..schemas.cities import CityCreate, CityUpdate
from ..utils.geo import enrich_geo_data  # helper to rellenar region, etc.

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

SIMILARITY_THRESHOLD = 90

def _similar(a: str, b: str) -> bool:
    """Case‑folded fuzzy match."""
    return fuzz.ratio(a.strip().lower(), b.strip().lower()) >= SIMILARITY_THRESHOLD


async def _find_by_geonames(db: AsyncSession, geonames_id: int | None) -> City | None:
    if geonames_id is None:
        return None
    stmt: Select = select(City).where(City.geonames_id == geonames_id)
    result = db.execute(stmt)
    return result.scalar_one_or_none()


async def _find_by_name_country(db: AsyncSession, name: str, country: str) -> City | None:
    stmt: Select = select(City).where(City.country == country)
    result = db.execute(stmt)
    for city in result.scalars():
        if _similar(city.name, name):
            return city
    return None


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def get_or_create_city(db: AsyncSession, payload: CityCreate) -> City:
    """Return existing city or create a new enriched one."""
    # 1. Lookup by geonames_id
    city = await _find_by_geonames(db, payload.geonames_id)
    if city:
        return city

    # 2. Lookup by name + country (fuzzy)
    city = await _find_by_name_country(db, payload.name, payload.country)
    if city:
        return city

    # 3. Enrich with geo‑metadata
    geo = enrich_geo_data(payload.name, payload.country)

    print(f'geo: {geo}') 
    print(f"Creating new city: {payload.name} in {payload.country} with geonames_id {geo['geonames_id']}")
    new_city = City(
        name=payload.name.strip().lower().capitalize(),
        country=payload.country.upper(),
        region=geo.get('region',''),
        continent=geo.get('continent',''),
        latitude=geo.get('latitude',''),
        longitude=geo.get('longitude',''),
        geonames_id=geo.get('geonames_id',''),
        needs_bus_permit=payload.needs_bus_permit or False,
        updated_by=payload.created_by,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    db.add(new_city)
    db.commit()
    db.refresh(new_city)
    return new_city


async def list_cities(db: AsyncSession, *, country: str | None = None) -> Sequence[City]:
    stmt: Select = select(City)
    if country:
        stmt = stmt.where(City.country == country.upper())
    result = db.execute(stmt.order_by(City.name))
    return list(result.scalars())


async def get_city(db: AsyncSession, city_id: int) -> City:
    """Get a city by its ID."""
    result = db.execute(select(City).where(City.id == city_id))
    
    return result.scalar_one()


async def update_city(db: AsyncSession, city_id: int, payload: CityUpdate) -> City:
    stmt = (
        update(City)
        .where(City.id == city_id)
        .values(**payload.model_dump(exclude_none=True), updated_at=datetime.utcnow())
    )
    db.execute(stmt)  # Ejecutar la consulta UPDATE
    db.commit()  # Confirmar los cambios

    # Recuperar los datos actualizados con un SELECT
    result = db.execute(select(City).where(City.id == city_id))
    city = result.scalar_one()  # Obtener la instancia actualizada
    return city


async def delete_city(db: AsyncSession, city_id: int) -> None:
    city = db.get(City, city_id)
    if city is None:
        return
    db.delete(city)
    db.commit()
