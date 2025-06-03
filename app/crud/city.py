from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.cities import Cities
from app.schemas.city import CityCreate
from app.utils.normalizers import normalize_city


async def get_city_by_name(db: AsyncSession, name: str) -> Cities | None:
    q = db.execute(select(Cities).where(Cities.name == name))
    return q.scalars().first()

async def get_city_by_id(db: AsyncSession, city_id: str) -> Cities | None:
    q = db.execute(select(Cities).where(Cities.id == city_id))
    return q.scalars().first()

async def get_cities(db: AsyncSession) -> list[Cities]:
    q = db.execute(select(Cities).order_by(Cities.name))
    return q.scalars().all()

async def create_city(db: AsyncSession, data: CityCreate) -> Cities:
    new = Cities(**data)
    db.add(new)
    db.commit()
    db.refresh(new)
    return new


async def get_or_create_city(db: AsyncSession, raw_name: str, raw_country: str | None = None) -> Cities:
    # 1) Intentar encontrar ciudad creada
    city = await get_city_by_name(db, raw_name)
    if city:
        return city

    # 2) Normalizar con geonamescache
    norm = normalize_city(raw_name, raw_country)
    name    = norm['name']        if norm else raw_name
    country = norm['countrycode'] if norm else raw_country

    city_data = {
        "name": name,
        "country": country,
        "region": None,  # No region provided in this context
        "needs_bus_permit": False  # Default value
    }

    # 3) Crear nueva ciudad
    return await create_city(db, city_data)