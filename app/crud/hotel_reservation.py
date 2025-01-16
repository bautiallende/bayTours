from sqlalchemy.ext.asyncio import AsyncSession
from app.models.hotel_reservation import HotelReservation
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import update
from sqlalchemy.future import select
from datetime import time, date


async def create(db:AsyncSession, hotel_data: HotelReservation):
    db.add(hotel_data)
    db.commit()
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
    


async def get_by_group_and_date(db:AsyncSession, id_group:str, start_date:date, end_date:date):
    query = db.execute(
        select(HotelReservation).
        where(HotelReservation.id_group == id_group).
        where(HotelReservation.start_date >= start_date).
        where(HotelReservation.end_date <= end_date)
    )
    return query.scalars().all()