from sqlalchemy.ext.asyncio import AsyncSession
from .client_handler import clients_handlers
import pandas as pd
from app.crud import clients as clients_functions


async def new_group(db: AsyncSession, df: pd.DataFrame, group_number:str, circuit_name:str):
    handler = clients_handlers.get("New_group")
    response = await handler(db=db, df=df, group_number=group_number, circuit_name=circuit_name)
    return response


async def get_clients(db: AsyncSession, paternal_surname: str, first_name:str, passaport:str = None, birth_date = None):
    result = await clients_functions.get_clients(db=db, paternal_surname=paternal_surname, first_name=first_name, passaport=passaport, birth_date=birth_date)
    return result


async def get_clients_by_group_id(db: AsyncSession, id_group:str):
    request = await clients_functions.get_clients_by_group_id(db=db, id_group=id_group)
    return request