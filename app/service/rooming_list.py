import pandas as pd
from sqlalchemy.ext.asyncio import AsyncSession
from .rooming_list_handler import rooming_list_handlers



async def create_rooming(db:AsyncSession, df_file:pd.DataFrame):
    handler = rooming_list_handlers.get('create_rooming')

    response = await handler(db=db, df=df_file)

    return response




