from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.transport_company import TransportCompany




async def get_companys(db:AsyncSession):
    result = db.execute(select(TransportCompany))
    transport_companies = result.scalars().all()
    return transport_companies