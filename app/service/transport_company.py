from sqlalchemy.ext.asyncio import AsyncSession
from app.crud import transport_company as transport_company_functions


async def get_companys(db:AsyncSession):
    result = await transport_company_functions.get_companys(db=db)
    return result