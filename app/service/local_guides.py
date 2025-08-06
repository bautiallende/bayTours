from fastapi import HTTPException
from uuid import uuid4
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.local_guides import LocalGuides
from app.crud import local_guides as local_guides_functions
from typing import List, Optional
from datetime import datetime, timedelta
from app.crud import cities as cities_service
from app.crud import local_guide_tariffs as tariffs_crud
from .local_guides_hanlder import guides_handler
from app.schemas.local_guides import LocalGuideCreate, LocalGuideUpdate, LocalGuideRead, LocalGuideFilter


async def create_local_guide(local_guide: LocalGuides, db: AsyncSession):
    """
    Create a new local guide.
    """
    handler = guides_handler.get('create')
    if not handler:
        raise HTTPException(status_code=500, detail="Handler not found")
    new_local_guide = await handler.create_local_guide(db=db, local_guide_data=local_guide)
    return new_local_guide


async def update_local_guide(id_local_guide: int, local_guide: LocalGuides, db: AsyncSession):
    """
    Update an existing local guide.
    """
    handler = guides_handler.get('update')
    if not handler:
        raise HTTPException(status_code=500, detail="Handler not found")
    updated_local_guide = await handler.update_local_guide(id_local_guide=id_local_guide, payload=local_guide, db=db)
    return updated_local_guide


async def get_all(db: AsyncSession, city: int, flt: LocalGuideFilter):
    """
    Retrieve all active local guides for a specific city.
    """
    response = await local_guides_functions.get_all(city=city, db=db, flt=flt)
    return response


async def get_cities(db: AsyncSession):
    """
    Retrieve all cities with local guides.
    """
    response = await local_guides_functions.get_cities(db=db)
    return response


async def get_local_guide_by_id(id_local_guide: int, db: AsyncSession) -> Optional[LocalGuides]:
    """
    Retrieve a local guide by its ID.
    """
    local_guide = await local_guides_functions.get_local_guide_by_id(id_local_guide=id_local_guide, db=db)
    if not local_guide:
        raise HTTPException(status_code=404, detail="Local guide not found")
    return local_guide


async def get_local_guide_full(
    db: AsyncSession,
    id_local_guide: int,
) -> LocalGuideRead:
    # Guía
    guide = await local_guides_functions.get_local_guide_by_id(
        db=db, id_local_guide=id_local_guide
    )
    if guide is None:
        raise HTTPException(404, "Local guide not found")

    # Tarifas
    tariffs = await tariffs_crud.list_tariffs(db, id_local_guide)

    # Inyectar tarifas en el objeto antes de model_validate
    guide.tariffs = tariffs
    return LocalGuideRead.model_validate(guide, from_attributes=True)