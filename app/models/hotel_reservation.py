from sqlalchemy import Column, Integer, String, Date, DateTime, Time, Boolean
from ..database import Base

class HotelReservation(Base):
    __tablename__ = "hotel_reservation"

    id  = Column(String(255), primary_key=True)
    id_days = Column(String(255))
    id_hotel = Column(Integer)
    date = Column(Date)
    time = Column(Time)
    comment = Column(String(255))
    PAX =  Column(Integer)

