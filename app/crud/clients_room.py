from sqlalchemy.ext.asyncio import AsyncSession
import json
from sqlalchemy import and_
from typing import List
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import update
from sqlalchemy.future import select
from sqlalchemy import asc, desc
from datetime import time
from datetime import timedelta, datetime
from app.models.clients_room import ClientsRoom
from app.models.hotel import Hotel
from app.models.clients import Clients
from app.models.hotels_room import HotelsRooms
from app.models.days import Days
from app.models.hotel_reservation import HotelReservation


async def new_room(db:AsyncSession, client_room_data:ClientsRoom):
    db.add(client_room_data)
    db.commit()
    db.refresh(client_room_data)
    return client_room_data


async def update_room(db:AsyncSession, client_room_data:ClientsRoom):
    db.commit()
    db.refresh(client_room_data)
    return client_room_data


async def get_room_by_id_group_and_city(db:AsyncSession, id_days:List[str],  filters:dict=None):
    query =( 
        select(
            ClientsRoom.id,
            ClientsRoom.id_days,
            ClientsRoom.room_number, 
            ClientsRoom.check_in_date, 
            ClientsRoom.departure_date, 
            ClientsRoom.complement,
            ClientsRoom.complement_currency,
            ClientsRoom.status, 
            ClientsRoom.comments,
            Clients.id_clients,
            Clients.paternal_surname, 
            Clients.mother_surname,
            Clients.first_name,
            Clients.second_name,
            Clients.birth_date,
            Clients.sex,
            Clients.passport,
            HotelsRooms.id_room, 
            HotelsRooms.type, 
            HotelsRooms.price,
            HotelsRooms.currency,
            Hotel.id_hotel, 
            Hotel.hotel_name, 
            Hotel.city,
            Days.date, 
            HotelReservation.id.label('id_hotel_reservation')
            ).outerjoin(
                Clients, ClientsRoom.client_id == Clients.id_clients
                ).outerjoin(
                    HotelsRooms, ClientsRoom.id_room == HotelsRooms.id_room
                    ).outerjoin(
                        Hotel, HotelsRooms.id_hotel == Hotel.id_hotel
                        ).outerjoin(Days, Days.id == ClientsRoom.id_days
                                    ).outerjoin(HotelReservation, HotelReservation.id_day == ClientsRoom.id_days)
                        .where(ClientsRoom.id_days.in_(id_days)).order_by(Days.date.asc()).order_by(Clients.mother_surname.asc())
        )
    
    if filters:
        if "passengers" in filters and filters["passengers"]:
            query = query.filter(Clients.id_clients.in_(filters["passengers"]))
        # Filtro por rango de edad
        if "min_age" in filters and "max_age" in filters:
            current_year = datetime.now().year
            min_birth_year = current_year - int(filters["max_age"])  # Edad máxima corresponde al año mínimo
            max_birth_year = current_year - int(filters["min_age"])  # Edad mínima corresponde al año máximo
            print(f"{min_birth_year}-01-01", f"{max_birth_year}-12-31")
            query = query.filter(
                Clients.birth_date.between(f"{min_birth_year}-01-01", f"{max_birth_year}-12-31")
            )
        elif "min_age" in filters:
            current_year = datetime.now().year
            max_birth_year = current_year - int(filters["min_age"])
            print(f"{max_birth_year}-12-31")
            query = query.filter(Clients.birth_date <= f"{max_birth_year}-12-31")
        elif "max_age" in filters:
            current_year = datetime.now().year
            min_birth_year = current_year - int(filters["max_age"])
            print(f"{min_birth_year}-01-01")
            query = query.filter(Clients.birth_date >= f"{min_birth_year}-01-01")

        # Filtro por sexo
        if "sex" in filters and filters["sex"]:
            #sex = "M" if filters["sex"].lower() in ["masculino", "m"] else "F"
            query = query.filter(Clients.sex == filters["sex"])

        if 'date' in filters and filters['date']:
            query = query.filter(Days.date == filters['date'])
        
        if 'hotel' in filters and filters['hotel']:
            query = query.filter(Hotel.hotel_name == filters['hotel'])
        
        if 'city' in filters and filters['city']:
            query = query.filter(Hotel.city == filters['city'])
        
        if 'room_type' in filters and filters['room_type']:
            query = query.filter(HotelsRooms.type == filters['room_type'])
        
        # TODO: aca terminar de corregir el mayor o menos rl precio
        if 'room_price' in filters and filters['room_price']:
            query = query.filter(HotelsRooms.price <= filters['room_price'])
        
        if 'complement' in filters and filters['complement']:
            query = query.filter(ClientsRoom.complement <= filters['complement'])
        
        if 'status' in filters and filters['status']:
            query = query.filter(ClientsRoom.status == filters['status'])


    result = db.execute(query)
    rows = result.fetchall()

    print(f"result: {rows}")

    formatted_rows = []
    for row in rows:
        formatted_row = {
            "id": row.id,
            "id_days": row.id_days,
            'id_hotel_reservation': row.id_hotel_reservation,
            "room_number": row.room_number,
            "check_in_date": row.check_in_date.strftime("%d/%m/%y %H:%M") if row.check_in_date else None,
            "departure_date": row.departure_date.strftime("%d/%m/%y %H:%M") if row.departure_date else None,
            "status": row.status,
            "comments": json.loads(row.comments) if row.comments else [],
            "id_clients": row.id_clients,
            "paternal_surname": row.paternal_surname,
            "mother_surname": row.mother_surname,
            "first_name": row.first_name,
            "second_name": row.second_name,
            "birth_date": row.birth_date,
            "sex": row.sex,
            "passport": row.passport,
            "id_room": row.id_room,
            "type": row.type,
            "price": row.price,
            "currency": row.currency,
            'supplements': row.complement,
            'supplements_currency': row.complement_currency,
            "id_hotel": row.id_hotel,
            "hotel_name": row.hotel_name,
            "city": row.city,
            "date": row.date.strftime("%d/%m") if row.date else None,
        }
        formatted_rows.append(formatted_row)

    return formatted_rows



async def get_room_by_client_and_id(db:AsyncSession, client_id:str, id:str):
    query = (
        select(ClientsRoom).where(
            and_(
                ClientsRoom.client_id == client_id,
                ClientsRoom.id == id
            )
        ))
    result = db.execute(query)
    return result.scalars().one()

async def get_city_by_id(db:AsyncSession, id_day:str):
    query = (
        select(Hotel.city)
        .select_from(Hotel)
        .join(HotelReservation, Hotel.id_hotel == HotelReservation.id_hotel)
        .where(HotelReservation.id_day == id_day)
        .group_by(Hotel.city)
    )
    result = db.execute(query)
    return result.scalars().all()


async def get_room_by_id_day(db:AsyncSession, id_day:str):
    query = select(ClientsRoom.id_room,
                   HotelsRooms.type).join(ClientsRoom, 
                       ClientsRoom.id_room == HotelsRooms.id_room).where(ClientsRoom.id_days == id_day).group_by(ClientsRoom.id_room)
    result = db.execute(query)
    print(f'query: {result}')
    return result.fetchall()
