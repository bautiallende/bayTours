from sqlalchemy import Column, Integer, String, DateTime, Time, Float, Boolean
from ..database import Base

class TransportCompany(Base):
    __tablename__ = "transport_company"

    company_id = Column(Integer, primary_key=True)
    name = Column(String(255))
    phone = Column(String(255))
    mail = Column(String(255))
    address = Column(String(255))
    update_datetime = Column(DateTime)
    active = Column(Boolean)