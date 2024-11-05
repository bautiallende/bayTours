from sqlalchemy import Column, Integer, String, Date, DateTime
from ..database import Base

class Clients(Base):
    __tablename__ = "clients"
    
    id_clients = Column(Integer, primary_key=True, index=True)
    paternal_surname = Column(String(255))
    mother_surname = Column(String(255))
    first_name = Column(String(255))
    second_name = Column(String(255))
    birth_date = Column(Date)
    sex = Column(String(255))
    nationality = Column(String(255))
    passport = Column(String(255))
    vtc_passport = Column(Date)
    phone = Column(String(255))
    mail = Column(String(255))
