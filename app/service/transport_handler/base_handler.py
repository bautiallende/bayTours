from sqlalchemy.ext.asyncio import AsyncSession
from uuid import uuid4
from app.models.transport import Transport
from app.crud import transport as transport_functions

class BaseHandler:

    async def create(self, db:AsyncSession):
        id_transport = str(uuid4())
        
        transport = Transport(
            id_transport=id_transport,
        )
        transport_line = await transport_functions.create(db, transport)
        return transport_line
    
    def __init__(self):
        pass