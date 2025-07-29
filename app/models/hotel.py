from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from ..database import Base
from sqlalchemy.orm import relationship


class Hotel(Base):
    __tablename__ = "hotel"

    id_hotel   = Column(Integer, primary_key=True, index=True)
    hotel_name = Column(String(255))
    id_city = Column(Integer, ForeignKey("cities.id"), index=True, nullable=True)
    country    = Column(String(255))
    address    = Column(String(255))

    phone_1 = Column(String(255))
    phone_2 = Column(String(255))
    phone_3 = Column(String(255))
    mail_1  = Column(String(255))
    mail_2  = Column(String(255))
    mail_3  = Column(String(255))

    agreements      = Column(String(255))
    payment_method  = Column(String(255))

    city = relationship("City", lazy="joined")