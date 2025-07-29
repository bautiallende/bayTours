from sqlalchemy.ext.asyncio import AsyncSession
from app.models.rooms_composition import RoomsComposition
from app.models.clients_room import ClientsRoom
from app.models.clients import Clients
from app.models.hotels_room import HotelsRooms
from app.models.hotel import Hotel
from app.models.cities import City
from sqlalchemy.future import select




async def create(db: AsyncSession, room_data: RoomsComposition):
    """
    Crea una nueva composición de habitación en la base de datos.
    """
    db.add(room_data)
    db.commit()
    db.refresh(room_data)
    return room_data


async def update(db: AsyncSession, room_data: RoomsComposition):
    """
    Actualiza una composición de habitación existente en la base de datos.
    """
    db.commit()
    db.refresh(room_data)
    return room_data


async def get_clients_by_id(db: AsyncSession, room_composition_id: str):
    query = select(Clients
                   ).join(ClientsRoom, ClientsRoom.client_id == Clients.id_clients
                          ).join(RoomsComposition, RoomsComposition.id == ClientsRoom.room_composition_id
                                 ).where(RoomsComposition.id == room_composition_id)
    result = db.execute(query)
    return result.scalars().all()


async def get_room_composition_by_id(db: AsyncSession, room_composition_id: str):
    query = select(RoomsComposition).where(RoomsComposition.id == room_composition_id)
    result = db.execute(query)
    return result.scalars().first()


async def get_room_composition_by_id_days(db: AsyncSession, id_days:str):
    query = (
        select(
            RoomsComposition.id,
            RoomsComposition.id_room,
            HotelsRooms.id_hotel,
            Hotel.hotel_name, 
            City.name.label("city"), 
            ClientsRoom.client_id
        )
        .select_from(RoomsComposition)
        .outerjoin(HotelsRooms, RoomsComposition.id_room == HotelsRooms.id_room)
        .outerjoin(Hotel, Hotel.id_hotel == HotelsRooms.id_hotel)
        .outerjoin(City, City.id == Hotel.id_hotel)
        .outerjoin(ClientsRoom, ClientsRoom.room_composition_id == RoomsComposition.id)
        .where(ClientsRoom.id_days == id_days)
    )
    result = db.execute(query)
    return result.fetchall()