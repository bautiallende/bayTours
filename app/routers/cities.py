from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.schemas.city import CityCreate, CityRead
from app.service.city import list_cities, create_city, list_countries_by_continent, list_cities_by_country
from ..dependencies import get_db

router = APIRouter(prefix="/cities", tags=["cities"])

@router.get("/", response_model=List[CityRead])
async def read_cities(db:Session = Depends(get_db)):
    return await list_cities(db)


@router.post("/", response_model=CityRead)
async def add_city(data: CityCreate, db:Session = Depends(get_db)):
    return await create_city(db, data)



@router.get("/countries", response_model=List[dict])
async def get_countries_by_continent(
    continent: str = Query(
        ...,
        description="Nombre del continente (en inglés o castellano), "
                    "p.ej. 'Europe', 'Europa', 'Norteamérica', 'Asia'"
    ),
):
    """
    Devuelve todos los países (name, code) que pertenezcan al continente indicado.
    Ejemplo: /geo/countries?continent=Europa
    """
    countries = list_countries_by_continent(continent)
    if not countries:
        # Podríamos devolver 200 con lista vacía, pero puede ser más útil advertir al cliente
        raise HTTPException(
            status_code=404,
            detail=f"No se encontró ningún continente coincidente con '{continent}'"
        )
    return countries


@router.get("/cities", response_model=List[dict])
async def get_cities_by_country(
    country: str = Query(
        ...,
        description="Nombre o código ISO2 del país (en inglés o castellano), "
                    "p.ej. 'Spain', 'España', 'US', 'Estados Unidos'"
    ),
):
    """
    Devuelve todas las ciudades (name, geonameid) para el país indicado.
    Ejemplo: /geo/cities?country=España
    """
    cities = list_cities_by_country(country)
    if not cities:
        raise HTTPException(
            status_code=404,
            detail=f"No se encontró ningún país coincidente con '{country}' o no hay ciudades registradas."
        )
    return cities