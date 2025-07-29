import json
from sqlalchemy.ext.asyncio  import AsyncSession
from fastapi import HTTPException
from .base_handler import HotelsReservationsHandlers
from app.models.hotel_reservation import HotelReservation
from app.models.clients_room import ClientsRoom
from app.service import days as days_service
from app.crud import hotel_reservation as hotel_reservation_funcions
from app.crud import clients_room as clients_room_funcions
from datetime import time, datetime, timedelta
from uuid import uuid4
from app.service import hotels as hotel_service
from app.service import hotel_reservation as hotel_reservation_service
from app.service import group as group_service
from app.schemas.hotel_reservation import CreateBaseHotel, HotelReservationSameDay, HotelReservationUpdate

class HotelReservationHandler(HotelsReservationsHandlers):

    async def create_base(self, db:AsyncSession, hotel_data:CreateBaseHotel):
        
        result = await super().create_base(db, hotel_data)
        return result


    async def create(self, db:AsyncSession, hotel_data:HotelReservation):

        hotel_info = await hotel_service.get_one(db=db, id_hotel=hotel_data.id_hotel)
        if not hotel_info:
            raise HTTPException(status_code=404, detail="El hotel no existe.")
        
        hotel_row = hotel_info[0]
        hotel_city_id = hotel_row.id_city

        itinerary = await days_service.get_all(db=db, id_group=hotel_data.id_group)

        # Validar que las fechas del hotel coincidan con el itinerario
        for day in itinerary:
            if hotel_data.start_date <= day.date < hotel_data.end_date:
                # Verificar si las ciudades coinciden
                if day.id_city != hotel_city_id:
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"El hotel '{hotel_row.hotel_name}' no corresponde con la ciudad "
                            f"del grupo en la fecha {day.date} "
                            f"(day.id_city={day.id_city} ≠ hotel.id_city={hotel_city_id})."
                        ),
                    )

        # Validar hoteles existentes para las mismas fechas
        existing_hotels = await hotel_reservation_service.get_by_group_and_date(
            db=db, id_group=hotel_data.id_group, start_date=hotel_data.start_date, end_date=hotel_data.end_date
            )
        
        print(f'existing_hotels: {existing_hotels}')
        total_pax_assigned = sum(hotel.PAX for hotel in existing_hotels) if existing_hotels else 0
        total_pax_after_insertion = total_pax_assigned + hotel_data.pax
    
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
            'PAX':hotel_data.pax, 
            'created_at': datetime.now(),
            'created_by':hotel_data.created_by
        })

        result = await hotel_reservation_funcions.create(db=db, hotel_data=hotel_data_db)
        return result
        

    async def create_one_more(self, db:AsyncSession, hotel_data:HotelReservationSameDay, allow = True):

        # TODO aca hay que crear los mismos controles que con el update

        comments = [hotel_data.comment] if hotel_data.comment else []

        hotel_data_db = HotelReservation(**{
            'id': str(uuid4()),
            'id_hotel': hotel_data.id_hotel,
            'id_group': hotel_data.id_group,
            'id_day': hotel_data.id_day,
            'start_date': hotel_data.start_date,
            'end_date': hotel_data.end_date,
            'PAX': hotel_data.pax,
            'currency': hotel_data.currency,
            'total_to_pay': hotel_data.total_to_pay,
            'comment': json.dumps(comments),
            'created_at': datetime.now(),
            'updated_by': hotel_data.updated_by,
            'rooming_list': hotel_data.rooming_list,
            'pro_forma': hotel_data.pro_forma,
            'payment_date': hotel_data.payment_date,
            'payment_done_date': hotel_data.payment_done_date,
            'payed_by': hotel_data.payed_by,
            'factura': hotel_data.factura,
            'iga': hotel_data.iga,
                })

        result = await hotel_reservation_funcions.create(db=db, hotel_data=hotel_data_db)

        num_days = (hotel_data.end_date - hotel_data.start_date).days

        if num_days > 1 and allow:

            group_info = await group_service.get_group(db=db, id_group=hotel_data.id_group)
            day_info = await days_service.get_all(db=db, id_group=hotel_data.id_group)

            for day in range(1, num_days):

                current_date = hotel_data.start_date + timedelta(days=day)
                base_records = await hotel_reservation_funcions.get_hotel_by_group_and_day(db=db, id_group=hotel_data.id_group, day_date=current_date)
                
                total_pax_assigned = sum(int(base_record.PAX) for base_record in base_records if base_record.PAX is not None)

                day_config = next((d for d in day_info if d.date == current_date), None)

                if total_pax_assigned + hotel_data.pax > group_info.PAX:
                    print(f"La suma de PAX para los hoteles ({total_pax_assigned + hotel_data.pax}) supera el total del grupo ({group_info.PAX}).")
                    return False
                
                save = False
                print(f'base_records: {base_records}')
                if len(base_records) == 1 and not base_records[0].id_hotel:
                    # Se arma un nuevo payload basado en el recibido, asignándole el id del registro base
                    new_payload = hotel_data.model_copy().model_dump()
                    new_payload['id'] = base_records[0].id
                    new_payload = HotelReservationUpdate(**new_payload)
                    updated = await super().update(db, new_payload)
                    save = True
                         
                else:
                    for base_record in base_records:
                        if base_record.start_date == hotel_data.start_date:
                            if base_record.id_hotel == hotel_data.id_hotel:
                                # Se arma un nuevo payload basado en el recibido, asignándole el id del registro base
                                new_payload = hotel_data.model_copy().model_dump()
                                new_payload['id'] = base_record.id
                                new_payload = HotelReservationUpdate(**new_payload)
                                updated = await super().update(db, new_payload)
                                save = True
                            
                    if not save:
                        # Si por alguna razón no se encuentra la fila base, se crea un nuevo registro
                        new_payload = hotel_data.model_copy().model_dump()
                        new_payload['id_day'] = day_config.id
                        new_payload['updated_by'] = ''
                        new_payload = HotelReservationSameDay(**new_payload)
                        created = await self.create_one_more(db, new_payload, allow=False)
        
        return result


    async def create_many(self, db: AsyncSession, new_hotel: HotelReservationSameDay | HotelReservationUpdate):
        # Calcular el número total de días de la reserva
        num_days = (new_hotel.end_date - new_hotel.start_date).days + 1
        print(f"Número de días: {num_days}")

        # Obtener información del hotel y del itinerario del grupo
        hotel_info = await hotel_service.get_one(db=db, id_hotel=new_hotel.id_hotel)
        day_info = await days_service.get_all(db=db, id_group=new_hotel.id_group)

        # Filtrar los días del itinerario para la ciudad del hotel (comparación sin sensibilidad a mayúsculas)
        itinerary_in_city = [d for d in day_info if d.id_city == hotel_info.id_city]
        if not itinerary_in_city:
            print("No hay días en el itinerario para la ciudad del hotel.")
            return False

        # Determinar el último día en el que el grupo está en la ciudad del hotel
        last_day_in_city = max(d.date for d in itinerary_in_city)
        if new_hotel.end_date > last_day_in_city:
            print(f"El checkout ({new_hotel.end_date}) es posterior al último día en la ciudad ({last_day_in_city}).")
            return False

        group_info = await group_service.get_group(db=db, id_group=new_hotel.id_group)

        results = []
        for day_offset in range(num_days):
            current_date = new_hotel.start_date + timedelta(days=day_offset)
            
            # Buscar en el itinerario el día correspondiente a la fecha actual
            day_config = next((d for d in day_info if d.date == current_date), None)
            if not day_config:
                print(f"No se encontró configuración para la fecha {current_date}.")
                return False
            # Verificar que la ciudad del itinerario coincida con la del hotel
            if day_config.id_city != hotel_info.id_city:
                print(f"La ciudad en el itinerario ({day_config.id_city}) no coincide con la del hotel ({hotel_info.id_city}) en {current_date}.")
                return False

            if new_hotel.id:
                # Modo actualización: se actualiza la fila base ya existente.
                if day_offset == 0:
                    # Para el primer día se actualiza el registro identificado en el payload
                    updated = await self.update(db, new_hotel)
                    results.append(updated)
                else:
                    # Para días adicionales se busca la fila base asociada a ese día
                    base_records = await hotel_reservation_funcions.get_hotel_by_group_and_day(db=db, id_group=new_hotel.id_group, day_date=current_date)

                    total_pax_assigned = sum(base_record.PAX for base_record in base_records)
                    

                    if total_pax_assigned + new_hotel.PAX > group_info.PAX:
                        print(f"La suma de PAX para los hoteles ({total_pax_assigned + new_hotel.PAX}) supera el total del grupo ({group_info.PAX}).")
                        return False
                    
                    save = False
                    for base_record in base_records:
                        if base_record.start_date == new_hotel.start_date:
                            if base_record.id_hotel == new_hotel.id_hotel:
                                # Se arma un nuevo payload basado en el recibido, asignándole el id del registro base
                                new_payload = new_hotel.model_copy()
                                new_payload.id = base_record.id
                                new_payload.id_day = base_record.id_day
                                updated = await self.update(db, new_payload)
                                results.append(updated)
                                save = True
                    if not save:
                        # Si por alguna razón no se encuentra la fila base, se crea un nuevo registro
                        new_payload = new_hotel.model_copy()
                        new_payload.id_day = day_config.id
                        created = await self.create_one_more(db, new_payload)
                        results.append(created)
            else:
                # Modo creación: se crea un registro nuevo para cada día, con un id nuevo.
                new_payload = new_hotel.model_copy()
                new_payload.id_day = day_config.id
                created = await self.create_one_more(db, new_payload)
                results.append(created)
        
        return results



    async def update(self, db:AsyncSession, hotel_data:HotelReservationUpdate):

        num_days = (hotel_data.end_date - hotel_data.start_date).days

        result = await super().update(db, hotel_data) # Esto esta bien solo lo comento para pruuebas  
        
        if num_days > 1:

            group_info = await group_service.get_group(db=db, id_group=hotel_data.id_group)
            day_info = await days_service.get_all(db=db, id_group=hotel_data.id_group)

            for day in range(0, num_days):

                current_date = hotel_data.start_date + timedelta(days=day)
                print(f'current_date: {current_date}')
                base_records = await hotel_reservation_funcions.get_hotel_by_group_and_day(db=db, id_group=hotel_data.id_group, day_date=current_date)
                
                total_pax_assigned = sum(int(base_record.PAX) for base_record in base_records if base_record.PAX is not None)

                day_config = next((d for d in day_info if d.date == current_date), None)

                print(f'total_pax_assigned: {total_pax_assigned}')
                print(f'hotel_data.pax: {hotel_data.pax}')

                if total_pax_assigned + hotel_data.pax > group_info.PAX:
                    print(f"La suma de PAX para los hoteles ({total_pax_assigned + hotel_data.pax}) supera el total del grupo ({group_info.PAX}).")
                    continue
                    #return False
                
                save = False
                print(f'base_records: {base_records}')
                if len(base_records) == 1 and not base_records[0].id_hotel:
                    # Se arma un nuevo payload basado en el recibido, asignándole el id del registro base
                    new_payload = hotel_data.model_copy()
                    new_payload.id = base_records[0].id
                    updated = await super().update(db, new_payload)
                    save = True
                         
                else:
                    for base_record in base_records:
                        if base_record.start_date == hotel_data.start_date:
                            if base_record.id_hotel == hotel_data.id_hotel:
                                # Se arma un nuevo payload basado en el recibido, asignándole el id del registro base
                                new_payload = hotel_data.model_copy()
                                new_payload.id = base_record.id
                                updated = await super().update(db, new_payload)
                                save = True
                            
                    if not save:
                        # Si por alguna razón no se encuentra la fila base, se crea un nuevo registro
                        new_payload = hotel_data.model_copy().model_dump()
                        new_payload['id_day'] = day_config.id
                        new_payload['updated_by'] = ''
                        new_payload = HotelReservationSameDay(**new_payload)
                        created = await self.create_one_more(db, new_payload, allow=False)

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

    




