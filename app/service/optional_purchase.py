from .optional_purchase_handler import optionals_purchases_handlers
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.optionals_purchase import OptionalsPurchase

async def create_optional_purchase(db: AsyncSession, group_number:str, id_clientes:str, packages:str, circuit_name:str, age:int):
    handler =  optionals_purchases_handlers.get('create_optional_purchase')
    response = await handler(db=db, group_number=group_number, id_clientes=id_clientes, packages=packages, circuit_name=circuit_name, age=age)
    return response


async def create_one(db:AsyncSession, optionals_purchase_data:OptionalsPurchase):
    handler = optionals_purchases_handlers.get('create_one')
    response = await handler(db=db, optional_purchase_data=optionals_purchase_data)
    return response


async def update_optional_purchase(db:AsyncSession, optionals_purchase_data:OptionalsPurchase):
    handler = optionals_purchases_handlers.get('update_optional_purchase')
    response = await handler(db=db, optional_purchase_data=optionals_purchase_data)
    return response


async def delete_optional_purchase(db:AsyncSession, id_group:str, client_id:str, id_activity:str):
    handler = optionals_purchases_handlers.get('delete')
    response = await handler(db=db, id_group=id_group, client_id=client_id, id_activity=id_activity)
    return response