from .optional_purchase_handler import optionals_purchases_handlers
from sqlalchemy.ext.asyncio import AsyncSession


async def create_optional_purchase(db: AsyncSession, group_number:str, id_clientes:str, packages:str, circuit_name:str, age:int):
    handler =  optionals_purchases_handlers.get('create_optional_purchase')
    response = await handler(db=db, group_number=group_number, id_clientes=id_clientes, packages=packages, circuit_name=circuit_name, age=age)
    return response
