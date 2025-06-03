from sqlalchemy import Column, Integer, String, DateTime, Time, Float, Date, TEXT, Boolean
from ..database import Base
from datetime import datetime

class Permit(Base):
    __tablename__ = "permit"

    id_permit = Column(String(255), primary_key=True)
    permit_date = Column(Date)
    permit_number = Column(String(255))
    managed_by = Column(String(255))
    status = Column(String(255))
    provider = Column(String(255))
    price = Column(Float)
    payed_with = Column(String(255))
    payment_date = Column(Date)
    comments =  Column(TEXT)
    created_at = Column(DateTime)


class CityPermitRequirement(Base):
    __tablename__ = "city_permit_requirement"

    code = Column(String(255), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    country_code = Column(String(255), nullable=False)
    country_name = Column(String(255), nullable=False)
    permit_needed = Column(Boolean, nullable=False, default=False)
    comment = Column(String(255), nullable=True)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(String(255), nullable=False)


    