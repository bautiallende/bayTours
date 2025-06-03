from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Optional
from app.crud.city import get_city_by_name, get_cities, create_city as crud_create_city
from app.schemas.city import CityCreate, CityRead
from app.utils.normalizers import normalize_city
import geonamescache
from fuzzywuzzy import process

async def list_cities(db: AsyncSession) -> List[CityRead]:
    cities = await get_cities(db)
    return [CityRead.model_validate(c) for c in cities]

async def create_city(db: AsyncSession, data: CityCreate) -> CityRead:
    # Normalize city name and country with geonamescache + fuzzywuzzy
    norm = normalize_city(data.name, data.country)
    if norm:
        canonical_name = norm['name']
        canonical_country = norm.get('countrycode')
    else:
        canonical_name = data.name
        canonical_country = data.country

    # Check if city already exists with canonical name
    existing = await get_city_by_name(db, canonical_name)
    if existing:
        return CityRead.model_validate(existing)

    # Create normalized city
    city_in = CityCreate(
        name=canonical_name,
        country=canonical_country,
        region=data.region,
        needs_bus_permit=data.needs_bus_permit
    )
    city = await crud_create_city(db, city_in)
    return CityRead.model_validate(city)



gc = geonamescache.GeonamesCache()
# get_countries() devuelve un dict: clave = ISO2 (e.g. "ES"), valor = {..., "name": "Spain", "continentcode": "EU", ...}
_countries: Dict[str, dict] = gc.get_countries()

# get_cities() devuelve un dict: clave = geonameid string (ej. "3117735"), valor = {"name": "Madrid", "countrycode": "ES", ...}
_cities: Dict[str, dict] = gc.get_cities()

# Mapeo de nombres de continentes (inglés y castellano) a su código Geonames (2 letras):
_continent_name_to_code = {
    # Inglés
    "africa":       "AF",
    "antarctica":   "AN",
    "asia":         "AS",
    "europe":       "EU",
    "north america":"NA",
    "south america":"SA",
    "oceania":      "OC",
    # Español (con acentos y sin acentos)
    "áfrica":       "AF",
    "africa":       "AF",
    "antártida":    "AN",
    "antartida":    "AN",
    "asia":         "AS",
    "europa":       "EU",
    "norteamérica": "NA",
    "norteamerica": "NA",
    "américa del norte": "NA",
    "america del norte": "NA",
    "suramérica":   "SA",
    "suramerica":   "SA",
    "américa del sur":"SA",
    "america del sur":"SA",
    "oceania":      "OC",
}


def _normalize_continent(raw: str) -> Optional[str]:
    """
    Dado un nombre de continente (e.g. "Europe", "Europa", "norteamérica"),
    devuelve el código de continente usado por geonamescache (e.g. "EU", "NA").
    """
    key = raw.strip().lower()
    return _continent_name_to_code.get(key)


def list_countries_by_continent(raw_continent: str) -> List[dict]:
    """
    Devuelve lista de países (nombre y código ISO2) que pertenezcan
    al continente indicado. raw_continent puede estar en INGLÉS o en ESPAÑOL.
    """
    code = _normalize_continent(raw_continent)
    if not code:
        return []  # si no encontramos el continente, devolvemos lista vacía

    result = []
    for iso2, info in _countries.items():
        if info.get("continentcode") == code:
            result.append({
                "name": info.get("name"),
                "code": iso2
            })
    # Orden alfabético por nombre
    result.sort(key=lambda x: x["name"])
    return result


def _get_country_code_from_name(raw_country: str, threshold: int = 80) -> Optional[str]:
    """
    Dado un nombre de país (por ejemplo "Spain", "España", "United States"),
    usamos fuzzywuzzy para aproximar al nombre oficial en inglés de geonamescache.
    Si el score < threshold, devolvemos None.
    """
    # Lista de nombres oficiales:
    all_names = [info["name"] for info in _countries.values()]
    match, score = process.extractOne(raw_country, all_names)
    if not match or score < threshold:
        # Quizá el raw_country sea ya un código ISO2 válido:
        code_up = raw_country.strip().upper()
        if code_up in _countries:
            return code_up
        return None

    # Encontrar el ISO2 correspondiente a ese nombre:
    for iso2, info in _countries.items():
        if info["name"] == match:
            return iso2
    return None


def list_cities_by_country(raw_country: str) -> List[dict]:
    """
    Dado un país (nombre o código ISO2, en inglés o en español),
    devolvemos una lista de ciudades de geonamescache para ese país.
    Cada elemento tiene {"name": <nombre_ciudad>, "geonameid": <id>}.
    """
    iso2 = _get_country_code_from_name(raw_country)
    if not iso2:
        return []

    result = []
    for geoid, info in _cities.items():
        # `info["countrycode"]` es el ISO2 del país:
        if info.get("countrycode") == iso2:
            result.append({
                "name": info.get("name"),
                "geonameid": geoid
            })
    # Orden alfabético por nombre de ciudad
    result.sort(key=lambda x: x["name"])
    return result