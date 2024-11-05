from sqlalchemy import Column, Integer, String, DateTime, Time, Float, Boolean
from ..database import Base

class Transport(Base):
    __tablename__ = "transport"

    id_transport = Column(Integer, primary_key=True, index=True)
    id_driver = Column(Integer)
    bus = Column(String(255))
    company = Column(String(255))
    status_bus = Column(String(255))
    parking_heathrow = Column(Boolean)
    parking_update_datetime = Column(DateTime)
    parking_user_id = Column(String(255))
    pass_paris = Column(Boolean)
    pass_paris_update_datetime = Column(DateTime)
    pass_paris_user_id = Column(String(255))
    voucher_vce_florence = Column(Boolean)
    voucher_update_datetime = Column(DateTime)
    voucher_user_id = Column(String(255))
