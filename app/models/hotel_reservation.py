from sqlalchemy import Column, Integer, String, Date, DateTime, Time, Boolean, FLOAT, TEXT
from ..database import Base

class HotelReservation(Base):
    __tablename__ = "hotel_reservation"

    id  = Column(String(255), primary_key=True)
    id_hotel = Column(Integer)
    id_group = Column(String(255))
    id_day = Column(String(255))
    start_date = Column(Date)
    hour_check_in = Column(Time, default="15:00:00")
    end_date = Column(Date)
    hour_check_out = Column(Time, default="10:00:00")
    PAX = Column(Integer)
    currency = Column(String(255))
    total_to_pay = Column(FLOAT)
    comment = Column(TEXT)
    created_at = Column(DateTime)
    updated_by = Column(String(255))
    rooming_list = Column(Boolean)
    pro_forma = Column(Boolean)
    payment_date = Column(Date)
    payment_done_date = Column(Date)
    payed_by = Column(String(255))
    factura = Column(Boolean)
    iga = Column(Boolean)
        

