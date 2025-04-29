from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..dependencies import get_db
from app.service import hotel_reservation as hotel_reservation_service
from app.schemas.hotel_reservation import HotelReservationCreate, HotelReservationUpdate, HotelReservationSameDay


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

    # Calcular la cantidad de días entre start_date y end_date
    num_days = (data.end_date - data.start_date).days + 1
    print(f'Numero de dias: {num_days}')

    new_reservation = {}

    # Crear el registro en la base de datos
    try:
        if num_days == 1:
            new_reservation = await hotel_reservation_service.create(db=db, hotel_data=data, type="create")
        else:
            hotel_assignement =  await hotel_reservation_service.check_day(db=db, start_date=data.start_date, days=num_days, id_hotel=data.id_hotel, id_group=data.id_group)
            if hotel_assignement:
                await hotel_reservation_service.create(db=db, hotel_data=data, type='create_many')
        return {"status": "success", "data": new_reservation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/asign_hotel_same_day')
async def asign_hotel_same_day(data: HotelReservationSameDay, db: Session = Depends(get_db)):
    # Validar las fechas
    if data.start_date > data.end_date:
        raise HTTPException(status_code=400, detail="La fecha de inicio no puede ser posterior a la fecha de fin.")
    
    # Calcular la cantidad de días entre start_date y end_date
    num_days = (data.end_date - data.start_date).days
    print(f'Numero de dias: {num_days}')

    new_reservation = {}

    # Crear el registro en la base de datos
    try:
        if num_days == 1:
            new_reservation = await hotel_reservation_service.create(db=db, hotel_data=data, type='create_one_more')
        else:
            hotel_assignement =  await hotel_reservation_service.check_day(db=db, start_date=data.start_date, days=num_days, id_hotel=data.id_hotel, id_group=data.id_group)
            if hotel_assignement:
                await hotel_reservation_service.create(db=db, hotel_data=data, type='create_one_more')
        return {"status": "success", "data": new_reservation}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    


@router.put("/update_hotel_reservation")
async def update_hotel_reservation(data: HotelReservationUpdate, db: Session = Depends(get_db)):
    """
    Endpoint para actualizar los datos de un hotel asociado a un grupo.
    """
    # Validar las fechas
    if data.start_date > data.end_date:
        raise HTTPException(status_code=400, detail="La fecha de inicio no puede ser posterior a la fecha de fin.")

    # Calcular la cantidad de días entre start_date y end_date
    num_days = (data.end_date - data.start_date).days 
    print(f'Numero de dias: {num_days}')

    new_reservation = {}

    try:
        if num_days == 1:
            updated_reservation = await hotel_reservation_service.update(db=db, hotel_data=data)
        else:
            hotel_assignement =  await hotel_reservation_service.check_day(db=db, start_date=data.start_date, days=num_days, id_hotel=data.id_hotel, id_group=data.id_group)
            if hotel_assignement:
                updated_reservation = await hotel_reservation_service.update(db=db, hotel_data=data)
            else:
                raise HTTPException(status_code=409, detail="No se puede realizar la reserva para este hotel en este rango de fechas.")
        return {"status": "success", "data": updated_reservation}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    



@router.get("/get_hotel_reservation")
async def get_hotel_reservation(id_group: str, db: Session = Depends(get_db)):
    try:
        hotel_reservation_data = await hotel_reservation_service.get_hotel_reservation(db=db, id_group=id_group)
        return {"status": "success", "hotel_assignments": hotel_reservation_data}
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



@router.get("/get_by_group_and_date") # funcion solo de pruebam eliminar(?) se va a usar para cuartos
async def get_by_group_and_date(id_group:str, date_day:str, db: Session = Depends(get_db)):
    from app.crud.hotel_reservation import get_hotel_by_group_and_day
    from app.crud.days import get_day_by_id_days
    city_data =  await get_day_by_id_days(db=db, id_days=date_day)
    city = city_data.city
    response = await get_hotel_by_group_and_day(db=db, id_group=id_group, city=city)
    print("response", response)
    return response


