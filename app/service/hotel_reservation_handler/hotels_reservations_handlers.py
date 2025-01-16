from sqlalchemy.ext.asyncio  import AsyncSession
from fastapi import HTTPException
from .base_handler import BaseHandler
from app.models.hotel_reservation import HotelReservation
from app.models.clients_room import ClientsRoom
from app.service import days as days_service
from app.crud import hotel_reservation as hotel_reservation_funcions
from app.crud import clients_room as clients_room_funcions
from datetime import time, datetime
from uuid import uuid4
from app.service import hotels as hotel_service
from app.service import hotel_reservation as hotel_reservation_service
from app.service import group as group_service

class HotelReservationHandler(BaseHandler):
    async def create(self, db:AsyncSession, hotel_data:HotelReservation):

        hotel_info = await hotel_service.get_one(db=db, id_hotel=hotel_data.id_hotel)
        if not hotel_info:
            raise HTTPException(status_code=404, detail="El hotel no existe.")
        

        itinerary = await days_service.get_all(db=db, id_group=hotel_data.id_group)

        # Validar que las fechas del hotel coincidan con el itinerario
        for day in itinerary:
            print(f'el day es: {day.city}')
            if hotel_data.start_date <= day.date < hotel_data.end_date:
                print(f"hotel_data.start_date: {hotel_data.start_date}, day.date: {day.date}, hotel_data.end_date: {hotel_data.end_date}")
                # Verificar si las ciudades coinciden
                if (day.city).lower() != (hotel_info[0].city).lower():
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"El hotel '{hotel_info[0].hotel_name}' no corresponde con la ciudad del grupo "
                            f"en las fechas dadas ({day.city} vs {hotel_info[0].city})."
                        )
                    )

        # Validar hoteles existentes para las mismas fechas
        existing_hotels = await hotel_reservation_service.get_by_group_and_date(
            db=db, id_group=hotel_data.id_group, start_date=hotel_data.start_date, end_date=hotel_data.end_date
            )
        
        total_pax_assigned = sum(hotel.PAX for hotel in existing_hotels) if existing_hotels else 0
        total_pax_after_insertion = total_pax_assigned + hotel_data.PAX
    
        group_info = await group_service.get_group(db=db, id_group=hotel_data.id_group)
        if not group_info:
            raise HTTPException(status_code=404, detail="El grupo no existe.")

        if total_pax_after_insertion > group_info.PAX:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"La suma de PAX para los hoteles ({total_pax_after_insertion}) supera el total del grupo ({group_info.PAX})."
                )
            )
        
        # Verificar que no haya múltiples hoteles para la misma ciudad
        for existing_hotel in existing_hotels:
            if existing_hotel.id_hotel == hotel_data.id_hotel:
                raise HTTPException(
                    status_code=400,
                    detail=f"El hotel '{hotel_info.name}' ya está asignado para estas fechas."
                )

        
        hotel_data_db = HotelReservation(**{
            'id': str(uuid4()),
            'id_hotel': hotel_data.id_hotel, 
            'id_group': hotel_data.id_group,
            'start_date': hotel_data.start_date, 
            'end_date': hotel_data.end_date,
            'PAX':hotel_data.PAX, 
            'created_at': datetime.now(),
            'created_by':hotel_data.created_by
        })

        result = await hotel_reservation_funcions.create(db=db, hotel_data=hotel_data_db)
        return result
        
        
        

    

    async def update_many(self, db:AsyncSession, id_group:str, client_id:list, id_hotel:str, id_days:list, time_hotel:time):

        pax = len(client_id)

        
        for d in id_days:
            
            # Guardamos en la tabla de hotell_reservation
            result = await hotel_reservation_funcions.update_many_hotel_reservation(db=db, id_days=id_days, id_hotel=id_hotel, pax=pax, time_hotel=time_hotel)

            print(result)
            
            for c in client_id:
                client_rooms_data = ClientsRoom(**{
                    "id": str(uuid4()),
                    "client_id": c.get("client_id"),
                    "id_room": None, 
                    "id_group": id_group, 
                    "id_hotel": id_hotel
                    })
            
                # Guardamos en la tabla de clients_room
                response = await clients_room_funcions.new_room(db=db, client_room_data=client_rooms_data)

    




