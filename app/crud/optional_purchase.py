from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
from app.models.optional_purchase import OptionalPurchase
from app.models.optionals import Optionals
from app.models.days import Days
from app.models.activity import Activity
from app.models.optionals import Optionals



async def create_one(db:AsyncSession, optional_purchase_data:OptionalPurchase):
    db.add(optional_purchase_data)
    db.commit()
    print(f'\n\n Opcional creada: \n{optional_purchase_data}\n\n')
    return optional_purchase_data



async def update_one(db:AsyncSession, optional_purchase_data:OptionalPurchase):
    db.commit()
    db.refresh(optional_purchase_data)
    print(f'\n\n Opcional actualizada: \n{optional_purchase_data}\n\n')
    return optional_purchase_data


async def delete(db:AsyncSession, optional_purchase_data:OptionalPurchase):
    db.delete(optional_purchase_data)
    db.commit()
    print(f'\n\n Opcional eliminada: \n{optional_purchase_data}\n\n')
    return optional_purchase_data


async def get_one(db:AsyncSession, id_group:str, client_id:str, id_activity:str):
    result = db.execute(
        select(OptionalPurchase).
        where(OptionalPurchase.id_group == id_group).
        where(OptionalPurchase.client_id == client_id).
        where(OptionalPurchase.id_activity == id_activity)
    ).scalars().first()
    return result


async def get_optionals_with_id_days(db:AsyncSession, id_group:str, id_days:str):
    result = db.execute(
        select(
            Activity.id,
            Activity.id_optional,
            Optionals.name,
            Optionals.adult_price,
            Optionals.minor_price).
            join(Activity, Activity.id_optional == Optionals.id_optional, isouter=True).
            join(Days, Days.id == Activity.id_days, isouter=True).
            where(and_(Days.id == id_days, Days.id_group == id_group))
            )
    optionals = result.fetchall()
    optional_data = []
    for o in optionals:
        optional_data.append({
            'id_activity': o.id,
            'id_optional': o.id_optional,
            'name': o.name,
            'adult_price': o.adult_price,
           'minor_price': o.minor_price
        })

    return optional_data



async def get_clients_optiona(db:AsyncSession, client_id:str, group_id:str, id_days:str):
    result = db.execute(
        select(
            OptionalPurchase.id_group,
            OptionalPurchase.client_id,
            OptionalPurchase.id_activity,
            OptionalPurchase.id_optionals,
            Optionals.name.label("optional_name"),
            OptionalPurchase.status,
            OptionalPurchase.price, 
            OptionalPurchase.discount,
            OptionalPurchase.total,
            OptionalPurchase.place_of_purchase,
            OptionalPurchase.source,
            OptionalPurchase.payment_method).
            join(Activity, Activity.id == OptionalPurchase.id_activity, isouter=True).
            join(Days, Days.id == Activity.id_days, isouter=True).
            join(Optionals, Optionals.id_optional == OptionalPurchase.id_optionals, isouter=True).
            where(and_(OptionalPurchase.client_id == client_id, OptionalPurchase.id_group == group_id, Days.id == id_days))
        )

    optionals = result.fetchall()


    return optionals