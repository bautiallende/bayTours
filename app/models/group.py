from sqlalchemy import Column, Integer, String, DateTime, Boolean, DATETIME
from ..database import Base

class Group(Base):
    __tablename__ = "group"
    
    id_group = Column(String(255), primary_key=True, index=True)
    id_guide = Column(Integer)
    id_transport = Column(Integer)
    assistant_id = Column(Integer)
    assistant_id_2 = Column(Integer)
    id_operations = Column(Integer)
    id_responsible_hotels = Column(String(255))
    status = Column(String(255))
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    initial_flight = Column(String(255))
    datetime_initial_flight = Column(DateTime)
    end_flight = Column(String(255))
    datetime_end_flight = Column(DateTime)
    IGA_circuit = Column(String(255))
    IGA_option = Column(String(255))
    PAX = Column(Integer)
    QR = Column(Boolean)
    circuit = Column(Integer)
