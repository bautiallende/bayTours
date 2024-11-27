from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.optional_purchase import OptionalPurchase


async def create_one(db:AsyncSession, optional_purchase_data:OptionalPurchase):
    db.add(optional_purchase_data)
    db.commit()
    return optional_purchase_data


async def get_one(db:AsyncSession, id_group:str, client_id:str, id_activity:str):
    result = db.execute(
        select(OptionalPurchase).
        where(OptionalPurchase.id_group == id_group).
        where(OptionalPurchase.client_id == client_id).
        where(OptionalPurchase.id_activity == id_activity)
    ).scalars().first()
    return result


async def update_one(db:AsyncSession, optional_purchase_data:OptionalPurchase):
    db.commit()
    db.refresh(optional_purchase_data)
    return optional_purchase_data


async def delete(db:AsyncSession, optional_purchase_data:OptionalPurchase):
    db.delete(optional_purchase_data)
    db.commit()
    return optional_purchase_data