from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload 
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlalchemy.future import select
from sqlalchemy import and_, or_, select
from typing import List, Optional
from datetime import date
from app.models.local_guides import LocalGuides
from app.models.cities import City
from app.models.local_guide_tariffs import LocalGuideTariff
from app.schemas.local_guides import LocalGuideFilter

async def create_local_guide(db: AsyncSession, local_guide_data: LocalGuides):
    """
    Create a new local guide.
    """
    
    db.add(local_guide_data)
    try:
        db.commit()
        return local_guide_data
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Local guide already exists")
    

async def update_local_guide(db: AsyncSession, local_guide_data: LocalGuides):
    """
    Update an existing local guide.
    """
    
    db.commit()
    db.refresh(local_guide_data)
    return local_guide_data


async def get_all(city: str, db:AsyncSession, flt: LocalGuideFilter):

    lg = LocalGuides
    t  = LocalGuideTariff

    stmt = (
        select(lg)
        .options(selectinload(lg.tariffs))     # ← precarga tarifas
        .where(
            and_(
                lg.active.is_(True),
                lg.id_city == int(city),
            )
        )
    )

    # filtros sobre la tabla principal
    if flt.surname:
        print(flt.surname)
        stmt = stmt.where(lg.surname.ilike(f"{flt.surname}%"))
    if flt.active is not None:
        stmt = stmt.where(lg.active == flt.active)
    if flt.payment_method:
        stmt = stmt.where(lg.payment_method == flt.payment_method)

    if (
        flt.id_optionals
        or flt.day_type
        or flt.currency
        or flt.pax_min
        or flt.pax_max
        or flt.price_min
        or flt.price_max
    ):
        stmt = stmt.join(t)
        if flt.id_optionals:
            stmt = stmt.where(
                or_(t.id_optional == None, t.id_optional.in_(flt.id_optionals))
            )
        if flt.day_type and flt.day_type != "any":
            stmt = stmt.where(t.day_type == flt.day_type)
        if flt.currency:
            stmt = stmt.where(t.currency == flt.currency.upper())
        if flt.pax_min is not None:
            stmt = stmt.where(t.pax_min <= flt.pax_min)
        if flt.pax_max is not None:
            stmt = stmt.where(or_(t.pax_max == None, t.pax_max >= flt.pax_max))
        if flt.price_min is not None:
            stmt = stmt.where(t.price >= flt.price_min)
        if flt.price_max is not None:
            stmt = stmt.where(t.price <= flt.price_max)


    result =  db.execute(stmt)
    guides = result.scalars().all()                     # cada guía trae .tariffs
    return guides


async def get_cities(db: AsyncSession):
    """
    Retrieve all cities with local guides.
    """
    result = db.execute(
        select(LocalGuides.id_city, City.name)
        .distinct()
        .outerjoin(City, City.id == LocalGuides.id_city)
        .where(LocalGuides.active == True)
    )
    rows = result.fetchall()
    cities = [{"city_id": row[0], "city_name": row[1]} for row in rows if row[0] is not None and row[1] is not None]
    return cities



async def get_local_guide_by_id(id_local_guide: int, db: AsyncSession) -> Optional[LocalGuides]:
    """
    Retrieve a local guide by its ID.
    """
    try:
        result = db.get(LocalGuides, id_local_guide)
        if not result:
            raise NoResultFound("Local guide not found")
        return result
    except NoResultFound as e:
        raise HTTPException(status_code=404, detail=str(e)) 