import json
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.hotel_reservation import HotelReservation
from app.models.hotel import Hotel
from collections import defaultdict
from app.models.days import Days
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import update
from sqlalchemy.future import select
from sqlalchemy import asc, desc
from sqlalchemy.orm import aliased
from datetime import time, date, datetime


async def create(db:AsyncSession, hotel_data: HotelReservation):
    db.add(hotel_data)
    db.commit()
    return hotel_data


async def update(db:AsyncSession, hotel_data:HotelReservation):
    db.commit()
    db.refresh(hotel_data)
    return hotel_data


async def update_many_hotel_reservation(db:AsyncSession, id_days:list, id_hotel:str, pax:int, time_hotel:time):
    try:
        # Validar que la lista de client_ids no esté vacía
        if not id_days:
            raise ValueError("La lista de client_ids está vacía. Proporcione al menos un ID de cliente.")

        # Realizar la actualización
        stmt = (
            update(HotelReservation)
            .where(HotelReservation.id_days.in_(id_days))
            .values(id_hotel=id_hotel, pax=pax, time=time_hotel)
        )

        # Ejecutar la consulta
        await db.execute(stmt)
        await db.commit()

        return stmt
    except Exception as e:
        await db.rollback()
        return {"error": f"Ocurrió un error al actualizar los datos: {str(e)}"}
    


async def update_one_hotel_reservation(db:AsyncSession, id_days:str, id_hotel:str, pax:int, time_hotel:time):
    try:
        # Validar que la lista de client_ids no esté vacía
        if not id_days:
            raise ValueError("La lista de client_ids está vacía. Proporcione al menos un ID de cliente.")

        # Realizar la actualización
        stmt = (
            update(HotelReservation)
            .where(HotelReservation.id_days == id_days)
            .values(id_hotel=id_hotel, pax=pax, time=time_hotel)
        )

        # Ejecutar la consulta
        await db.execute(stmt)
        await db.commit()

        return {"message": "Los datos del hotel se actualizaron correctamente para los clientes especificados."}
    except Exception as e:
        await db.rollback()
        return {"error": f"Ocurrió un error al actualizar los datos: {str(e)}"}
    


async def get_by_id(db:AsyncSession, id:str):
    query = db.execute(
        select(HotelReservation).
        where(HotelReservation.id == id)
    )
    return query.scalars().first()


async def get_by_group_and_date(db:AsyncSession, id_group:str, start_date:date, end_date:date):
    query = db.execute(
        select(HotelReservation).
        where(HotelReservation.id_group == id_group).
        where(HotelReservation.start_date >= start_date).
        where(HotelReservation.end_date <= end_date)
    )
    return query.scalars().all()

async def get_by_id_day(db:AsyncSession, id_day:str):
    query = db.execute(
        select(HotelReservation).
        where(HotelReservation.id_day == id_day)
    )
    return query.scalars().all()


async def get_by_group(db:AsyncSession, id_group:str, filters:dict=None):
    query = (
        select(
            HotelReservation.id, 
            HotelReservation.id_day,
            HotelReservation.id_hotel, 
            HotelReservation.id_group, 
            HotelReservation.start_date, 
            HotelReservation.end_date, 
            HotelReservation.PAX, 
            HotelReservation.currency, 
            HotelReservation.total_to_pay, 
            HotelReservation.comment, 
            HotelReservation.updated_by, 
            HotelReservation.rooming_list, 
            HotelReservation.pro_forma, 
            HotelReservation.payment_date, 
            HotelReservation.payment_done_date, 
            HotelReservation.payed_by,
            HotelReservation.factura, 
            HotelReservation.iga, 
            Hotel.hotel_name,
            Days.city,
            Days.day,
            Days.date
        )
        .outerjoin(Days, HotelReservation.id_day == Days.id)
        .outerjoin(Hotel, HotelReservation.id_hotel == Hotel.id_hotel)
        .where(HotelReservation.id_group == id_group)
        .order_by(Days.date.asc())
    )
    
    if filters:
        if 'city' in filters and filters['city']:
            query = query.where(Days.city == filters['city'])
        if 'hotel' in filters and filters['hotel']:
            query = query.where(Hotel.hotel_name == filters['hotel'])
        if 'date' in filters and filters['date']:
            date_convert = datetime.strptime(filters['date'], "%d/%m/%Y")
            date_convert = date_convert.strftime("%Y-%m-%d")
            query = query.where(Days.date == date_convert)
        if 'check_in' in filters and filters['check_in']:
            check_in_convert = datetime.strptime(filters['check_in'], "%Y-%m-%d")
            query = query.where(HotelReservation.start_date >= check_in_convert)
        if 'check_out' in filters and filters['check_out']:
            check_out_convert = datetime.strptime(filters['check_out'], "%Y-%m-%d")
            query = query.where(HotelReservation.end_date <= check_out_convert)
        if 'pax' in filters and filters['pax']:
            query = query.where(HotelReservation.PAX == filters['pax'])
        if 'currency' in filters and filters['currency']:
            query = query.where(HotelReservation.currency == filters['currency'])
        if 'rooming_list' in filters and filters['rooming_list']:
            query = query.where(HotelReservation.rooming_list == filters['rooming_list'])
        if 'pro_forma' in filters and filters['pro_forma']:
            query = query.where(HotelReservation.pro_forma == filters['pro_forma'])
        if 'factura' in filters and filters['factura']:
            query = query.where(HotelReservation.factura == filters['factura'])
        if 'iga' in filters and filters['iga']:
            query = query.where(HotelReservation.iga == filters['iga'])
        if 'payment_date' in filters and filters['payment_date']:
            orientation = filters['payment_date'].get("op", '=')
            value = filters['payment_date'].get("value", None)
            if orientation == '=' and value is not None:
                query = query.where(HotelReservation.payment_date == value)
            elif orientation == '>' and value is not None:
                query = query.where(HotelReservation.payment_date >= value)
            elif orientation == '<' and value is not None:
                query = query.where(HotelReservation.payment_date <= value)
        if 'payment_done_date' in filters and filters['payment_done_date']:
            orientation = filters['payment_done_date'].get("op", '=')
            value = filters['payment_done_date'].get("value", None)
            if orientation == '=' and value is not None:
                query = query.where(HotelReservation.payment_done_date == value)
            elif orientation == '>' and value is not None:
                query = query.where(HotelReservation.payment_done_date >= value)
            elif orientation == '<' and value is not None:
                query = query.where(HotelReservation.payment_done_date <= value)
        if 'payed_by' in filters and filters['payed_by']:
            query = query.where(HotelReservation.payed_by == filters['payed_by'])


    result = db.execute(query)
    rows = result.fetchall()

    print(f"result: {rows}")

    # Crear un diccionario para almacenar la suma de pax por id_day
    pax_by_day = defaultdict(int)

    # Primera iteración para calcular la suma de pax por id_day
    for row in rows:
        pax_by_day[row.id_day] += int(row.PAX) if row.PAX else 0

    hotel_data = []

    for row in rows:
        print(f"row: {row}")
        data = {
            "assignment_id": row.id, 
            'id_day': row.id_day,
            'id_group': row.id_group,
            "city": row.city,
            "day": row.day,
            "date": row.date.strftime("%d/%m/%Y"),
            'id_hotel': row.id_hotel,
            "hotel_name": row.hotel_name,
            "check_in": row.start_date.strftime("%d/%m") if row.start_date else '',
            "check_out": row.end_date.strftime("%d/%m") if row.end_date else '',
            'pax': row.PAX,
            "assigned_pax": pax_by_day[row.id_day],
            "rooming_list": row.rooming_list,
            "pro_forma": row.pro_forma,
            "currency": row.currency,
            "total_to_pay": row.total_to_pay,
            "payment_date": row.payment_date.strftime("%d/%m") if row.payment_date else '',
            "payment_done_date": row.payment_done_date.strftime("%d/%m") if row.payment_done_date else '',
            "factura": row.factura,
            "iga": row.iga,
            "notes": json.loads(row.comment) if row.comment else [],
            }
        hotel_data.append(data)
  
    return hotel_data


async def get_hotel_by_group_and_day(db:AsyncSession, id_group:str, day_date:date):
    
    query = (
        select(
            HotelReservation.id, 
            HotelReservation.id_day,
            HotelReservation.id_hotel, 
            HotelReservation.id_group, 
            HotelReservation.start_date, 
            HotelReservation.end_date, 
            HotelReservation.PAX, 
            HotelReservation.currency, 
            HotelReservation.total_to_pay, 
            HotelReservation.comment, 
            HotelReservation.updated_by, 
            HotelReservation.rooming_list, 
            HotelReservation.pro_forma, 
            HotelReservation.payment_date, 
            HotelReservation.payment_done_date, 
            HotelReservation.payed_by,
            HotelReservation.factura, 
            HotelReservation.iga, 
            Hotel.hotel_name,
            Days.city,
            Days.day,
            Days.date
        )
        .outerjoin(Days, HotelReservation.id_day == Days.id)
        .outerjoin(Hotel, HotelReservation.id_hotel == Hotel.id_hotel)
        .where(HotelReservation.id_group == id_group )
        .where(Days.date == day_date)
    )

    print(query)

    result = db.execute(query)
    rows = result.fetchall()

    print(f"result: {rows}")
    return rows



