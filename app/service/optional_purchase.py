from .optional_purchase_handler import optionals_purchases_handlers
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.optionals_purchase import OptionalsPurchase
from app.crud import optional_purchase as optional_purchase_functions



async def create_optional_purchase(db: AsyncSession, group_number:str, id_clientes:str, packages:str, age:int, circuit_name:str = None, id_circuit:int = None):
    handler =  optionals_purchases_handlers.get('create_optional_purchase')
    response = await handler(db=db, group_number=group_number, id_clientes=id_clientes, packages=packages, circuit_name=circuit_name, age=age, id_circuit=id_circuit)
    return response


async def create_one(db:AsyncSession, optionals_purchase_data:OptionalsPurchase):
    handler = optionals_purchases_handlers.get('create_one')
    response = await handler(db=db, optional_purchase_data=optionals_purchase_data)
    return response


async def get_optionals_with_id_days(db:AsyncSession, id_group:str, id_days:str):
    result = await optional_purchase_functions.get_optionals_with_id_days(db=db, id_group=id_group, id_days=id_days)
    return result


async def get_client_optionals(db:AsyncSession, group_id:str, id_days:str, client_id:str):
    result = await optional_purchase_functions.get_clients_optiona(db=db, client_id=client_id, group_id=group_id, id_days=id_days)
    return result


async def update_optional_purchase(db:AsyncSession, optionals_purchase_data:OptionalsPurchase):
    handler = optionals_purchases_handlers.get('update_optional_purchase')
    response = await handler(db=db, optional_purchase_data=optionals_purchase_data)
    return response


async def delete_optional_purchase(db:AsyncSession, id_group:str, client_id:str, id_activity:str):
    handler = optionals_purchases_handlers.get('delete')
    response = await handler(db=db, id_group=id_group, client_id=client_id, id_activity=id_activity)
    return response