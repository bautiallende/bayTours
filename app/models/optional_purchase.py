from sqlalchemy import Column, Integer, String, DateTime, Time, Float
from ..database import Base

class OptionalPurchase(Base):
    __tablename__ = "optional_purchase"

    id = Column(Integer, primary_key=True)
    id_group = Column(String(255))
    client_id = Column(String(255))
    id_activity = Column(String(255))
    id_optionals = Column(Integer)
    status = Column(String(255))
    price = Column(Float)
    discount = Column(Float)
    total = Column(Float)
    purchase_date = Column(DateTime)
    place_of_purchase = Column(String(255))
    source = Column(String(255))
    payment_method = Column(String(255))