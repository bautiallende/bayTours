from .base_handler import BaseHandler
from uuid import uuid4
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.clients_room import ClientsRoom
from app.schemas.clients_room import HotelRoomUpdate
from app.service import days as days_service
from datetime import timedelta
from datetime import datetime


class ClientRoomHandler(BaseHandler):

    async def create(self, db:AsyncSession, client_id:str, group_id:str):
        
        ## aca debemos buscar en itinerari y crear un cuarto por cada dia del id_stage y el date
        days_data = await days_service.get_all(db=db, id_group=group_id)
        
        # Ordenar el itinerario por day_number para iterar en orden cronológico
        days_data.sort(key=lambda x: x.day)

        # Inicializar variables para el procesamiento
        current_city = None
        entry_date = None
        departure_date = None
        current_stage = None

        # Recorrer el itinerario para crear los registros de las habitaciones
        for day in days_data:
            if not current_city:
                entry_date = datetime.combine(day.date, datetime.strptime("15:00:00", "%H:%M:%S").time())  # Check-in a las 15:00

            # Si es el primer día o si el id_stage cambia, procesamos el nuevo stage
            # Esto queda comentado por el momento por que neceitamos un registro por dia. pero queda comentada por si la necesitamos mas adelante
            #if current_city != day.city and current_city:
            if True:
                
                # Crear el registro de la habitación
                room_entry = ClientsRoom(
                    id= str(uuid4()),
                    id_days= day.id,
                    id_hotel_reservation= None,
                    client_id= client_id,  
                    id_room= None,
                    room_number= None,
                    check_in_date= entry_date,
                    departure_date= departure_date,
                    status= 'New',
                    comments= None
                )
                db.add(room_entry)

                current_city = day.city
                entry_date = datetime.combine(day.date, datetime.strptime("15:00:00", "%H:%M:%S").time())
                departure_date = datetime.combine(day.date + timedelta(days=1), datetime.strptime("11:00:00", "%H:%M:%S").time())
            
            elif day.city == current_city or not current_city:
                departure_date = datetime.combine(day.date + timedelta(days=1), datetime.strptime("11:00:00", "%H:%M:%S").time())
                current_city = day.city

        # Guardar todos los cambios en la base de datos
        db.commit()

    async def update_room(self, db:AsyncSession, client_room_data:HotelRoomUpdate):
        # Actualizar el registro de la habitación
        room_data = await super().update(db, client_room_data)
        return room_data


    async def update_all_rooms(self, db:AsyncSession, ):
        pass