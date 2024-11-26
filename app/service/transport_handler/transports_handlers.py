from sqlalchemy.ext.asyncio import AsyncSession
from .base_handler import BaseHandler
from app.crud import transport as transport_functions

class TransportHandler(BaseHandler):
    async def update_bus(self, db:AsyncSession, id_group:str, company_id:str, bus_code:str):
        result = await transport_functions.update_bus(db=db, id_group=id_group, company_id=company_id, bus_code=bus_code)
        return result
