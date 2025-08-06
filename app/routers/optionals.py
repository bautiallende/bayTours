from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from ..dependencies import get_db

from app.service import optionals as optionals_service


router = APIRouter(
    prefix="/optionals",
    tags=["optionals"],
)

@router.get("/get_optionals/{id_city}")
async def get_optionals(id_city: int, db: Session = Depends(get_db)):
    """
    Get all optionals for a specific city.
    """
    result = await optionals_service.get_optionals_by_city(db=db, id_city=id_city)
    if not result:
        raise HTTPException(status_code=404, detail="No optionals found for this city")
    return result
