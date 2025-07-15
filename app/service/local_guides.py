from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.local_guides import LocalGuides
from app.crud import local_guides as local_guides_functions
from typing import List, Optional
from datetime import datetime, timedelta
from app.crud import cities as cities_service




async def get_all(db: AsyncSession, city: str):
    """
    Retrieve all active local guides for a specific city.
    """
    city_info = await cities_service.get_city_id(db, city)
    if not city_info:
        raise HTTPException(status_code=404, detail="City not found")

    response = await local_guides_functions.get_all(city=city_info.id, db=db)
    return response
    