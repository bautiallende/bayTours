from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..dependencies import get_db
from app.schemas import hotels
from app.schemas.clients_room import HotelRoomUpdate
from app.service import hotels as hotel_service
from app.service  import clients_room as client_room_service

router = APIRouter(
    prefix="/hotels_room",
    tags=["hotels_room"],
)


@router.put('/update_client_room')
async def update_client_room(client_room_data: HotelRoomUpdate, db: Session = Depends(get_db)):
    """
    Endpoint para actualizar los datos de una habitación de hotel.
    """
    try:
        client_room = await client_room_service.update_client_room(db=db, client_room_data=client_room_data)
        if isinstance(client_room, dict) and client_room.get("message") == "No hay suficientes habitaciones en el Hotel para este grupo":
            return HTTPException(status_code=400, detail=client_room["message"])
        return {"status": "success", "data": client_room}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put('/update_all_rooms')
async def update_all_rooms():
    pass



@router.get('/hotels_room')
async def get_hotels_room(id_hotel: int, db: Session = Depends(get_db)):
    """
    Endpoint para obtener los datos de una habitación de hotel.
    """
    try:
        hotel = await hotel_service.get_hotel_room(db=db, id_hotel=id_hotel)
        return {"status": "success", "data": hotel}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))