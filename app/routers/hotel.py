from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..dependencies import get_db
from app.schemas import hotels
from app.service import hotels as hotel_service

router = APIRouter(
    prefix="/hotels",
    tags=["hotels"],
)

@router.post("/create_hotel", response_model=hotels.HotelBase)
async def get_group(hotel_data: hotels.HotelBase, db: Session = Depends(get_db)):
    response = await hotel_service.create(db, hotel_data=hotel_data)
    if response is None:
        raise HTTPException(status_code=404, detail="Hotel not created")
    return response

