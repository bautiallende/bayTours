from sqlalchemy.ext.asyncio import AsyncSession
from app.models.circuits import Circuits
from sqlalchemy.future import select


async def get_circuit_id(db:AsyncSession, name:str):

    circuit = db.execute(select(Circuits).where(Circuits.name == name)) 
    circuit_data = circuit.scalars().one()

    print(f'circuit_data: {circuit_data.id_circuit}, {circuit_data.name}')
    
    return circuit_data 



    
