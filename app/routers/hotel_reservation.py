from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..dependencies import get_db
from app.service import hotel_reservation as hotel_reservation_service
from app.schemas.hotel_reservation import HotelReservationCreate 


router = APIRouter(
    prefix="/hotels_reservation",
    tags=["hotels_reservation"],
)



@router.post("/asign_hotel")
async def asign_hotel_reservation(data: HotelReservationCreate, db: Session = Depends(get_db)):
    """
    Endpoint para registrar un nuevo hotel asociado a un grupo.
    """
    # Validar las fechas
    if data.start_date > data.end_date:
        raise HTTPException(status_code=400, detail="La fecha de inicio no puede ser posterior a la fecha de fin.")
    
    # Validar la disponibilidad del hotel (opcional, si aplicable)
    # Aquí podríamos llamar a una función de validación si queremos verificar conflictos en la tabla existente.

    # Crear el registro en la base de datos
    try:
        new_reservation = await hotel_reservation_service.create(db=db, hotel_data=data)
        return {"status": "success", "data": new_reservation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




# @router.put("/asign_hotel")
# async def asign_one_hotel(id_group:str, client_id:list, id_hotel:str, id_days:list, db:Session = Depends(get_db)):
#     response = await hotel_reservation_service.asign_hotel(db=db, id_group=id_group, client_id=client_id, id_hotel=id_hotel, id_days=id_days)
#     if response is None:
#         raise HTTPException(status_code=404, detail="Hotel not assigned")
#     return response


# @router.post("/asign_many_hotel")
# async def asign_many_hotel(id_group:str, client_id:list, id_hotel:str, id_days:list, db:Session = Depends(get_db)):
#     response = await hotel_reservation_service.asign_many(db=db, id_group=id_group, client_id=client_id, id_hotel=id_hotel, id_days=id_days)
#     if response is None:
#         raise HTTPException(status_code=404, detail="Hotel not assigned")
#     return response

