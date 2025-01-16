from sqlalchemy import Column, Integer, String, Date, DateTime, Time, Boolean
from ..database import Base

class HotelReservation(Base):
    __tablename__ = "hotel_reservation"

    id  = Column(String(255), primary_key=True)
    id_hotel = Column(Integer)
    id_group = Column(String(255))
    start_date = Column(Date)
    end_date = Column(Date)
    PAX = Column(Integer)
    comment = Column(String(255))
    created_at = Column(DateTime)
    created_by = Column(String(255))
        

