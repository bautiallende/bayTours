from sqlalchemy import Column, Integer, String, Date, DateTime
from ..database import Base


class Circuits(Base):
    __tablename__ = "circuits"

    id_circuit = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    description = Column(String(255))
    total_nights = Column(Integer)