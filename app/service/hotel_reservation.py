from sqlalchemy.ext.asyncio import AsyncSession
from .hotel_reservation_handler import reservation_handler
from app.models.hotel_reservation import HotelReservation
from app.crud import hotel_reservation as hotel_reservation_functions
from datetime import date, timedelta
from app.schemas.hotel_reservation import CreateBaseHotel, HotelReservationSameDay, HotelReservationUpdate
from app.service import hotels as hotel_service
from app.service import days as days_service


async def create_base(db:AsyncSession, hotel_data:CreateBaseHotel):
    handler = reservation_handler.get('create_base')
    if handler:
        result = await handler.create_base(db=db, hotel_data=hotel_data)
        return result
    else:
        return None
    

async def create(db:AsyncSession, hotel_data:HotelReservation|HotelReservationSameDay, type:str):
    handler = reservation_handler.get(type)
    if handler:
        result = await handler(db=db, hotel_data=hotel_data)
        return result
    else:
        return None
    






async def update(db:AsyncSession, hotel_data:HotelReservationUpdate):
    handler = reservation_handler.get('update')
    if handler:
        result = await handler.update(db=db, hotel_data=hotel_data)
        return result
    else:
        return None

async def asign_many(db:AsyncSession, id_group:str, client_id:list, id_hotel:str, id_days:list):
    handler =  reservation_handler.get('update_many')

    if handler:
        result = await handler(db=db, id_group=id_group, client_id=client_id, id_hotel=id_hotel, id_days=id_days)
        return result
    else:
        return None



async def get_by_group_and_date(db:AsyncSession, id_group:str, start_date:date, end_date:date):
    result = await hotel_reservation_functions.get_by_group_and_date(db=db, id_group=id_group, start_date=start_date, end_date=end_date)
    return result


async def get_hotel_reservation(db:AsyncSession, id_group:str, filters:dict=None):
    result = await hotel_reservation_functions.get_by_group(db=db, id_group=id_group, filters=filters)
    print(result)
    return result


async def check_day(db:AsyncSession, start_date:date, days:int, id_hotel:str, id_group:str):
    
    hotel_info = await hotel_service.get_one(db=db, id_hotel=id_hotel)
    hotel_city_id = hotel_info[0].id_city
    
    day_info = await days_service.get_all(db=db, id_group=id_group)

    for offset in range(days):
        current_date = start_date + timedelta(days=offset)
        
        # Verificar si la ciudad del grupo en current_date coincide con la ciudad del hotel
        for day_config in day_info:
            if day_config.date == current_date:
                if day_config.id_city != hotel_city_id:
                    return False  # La ciudad no coincide, no es posible asignar el hotel

    return True  # Todas las ciudades coinciden, es posible asignar el hotel