from .packages_handler import packages_handlers
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud import packages as packages_functions



async def search_package(db:AsyncSession, id_circuit:int, packages:int):
    response = await packages_functions.get_packages(db=db, id_circuit=id_circuit, packages=packages)
    return response