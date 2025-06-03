# app/service/city_permit.py
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
import pycountry

from app.crud.permit import (
    get_city_permit,
    create_city_permit as crud_create,
    update_city_permit as crud_update,
    list_city_permits as crud_list
)
from app.schemas.permit import CityPermitBase, CityPermit
from app.models.permit import CityPermitRequirement

async def upsert_city_permit(db: AsyncSession, data: CityPermitBase) -> CityPermit:
    # Lookup subdivision in pycountry
    sub = pycountry.subdivisions.get(code=data.code)
    if not sub:
        raise ValueError(f"Código de ciudad '{data.code}' no encontrado en pycountry.subdivisions")
    name = sub.name
    country_code = sub.country_code
    country = pycountry.countries.get(alpha_2=country_code)
    country_name = country.name if country else ''

    existing = await get_city_permit(db=db, code=data.code)
    if existing:
        updated = await crud_update(
            db=db,
            existing=existing,
            permit_needed=data.permit_needed,
            comment=data.comment if data.comment or data.comment != 'string' else None,
            updated_by=data.updated_by
        )
        return CityPermit.from_orm(updated)

    new = CityPermitRequirement(
        code=data.code,
        name=name,
        country_code=country_code,
        country_name=country_name,
        permit_needed=data.permit_needed,
        comment=data.comment,
        updated_at=datetime.utcnow(),
        updated_by=data.updated_by
    )
    created = await crud_create(db=db, data=new)
    return CityPermit.from_orm(created)

async def list_city_permits(db: AsyncSession) -> list[CityPermit]:
    records = await crud_list(db=db)
    return [CityPermit.from_orm(rec) for rec in records]
