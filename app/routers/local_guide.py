from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from ..dependencies import get_db
from app.service import local_guides as local_guides_service



router = APIRouter(
    prefix="/local_guides",
    tags=["local_guides"],
)



@router.get('/local_guides')
async def get_guides(city: str, db:Session = Depends(get_db)):
    
    result = await local_guides_service.get_all(db=db, city=city)

    if not result:
        raise HTTPException(status_code=404, detail="No local guide found for this group")
    return result