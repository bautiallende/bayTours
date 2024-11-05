from sqlalchemy.ext.asyncio import AsyncSession
from app.models.client_group import ClientGroup
from sqlalchemy.future import select
from app.models.optional_purchase import OptionalPurchase
from app.models.clients import Clients
from app.models.optionals import Optionals


async def create_group(db:AsyncSession, group_data:ClientGroup):
    db.add(group_data)
    db.commit()
    db.refresh(group_data)
    return group_data



async def get_grouped_client_data(db: AsyncSession, id_group:str):
    # Consulta principal que obtiene datos básicos de cliente y opcionales comprados
    result = db.execute(
        select(
            Clients.paternal_surname,
            Clients.mother_surname,
            Clients.first_name,
            Clients.second_name,
            Clients.birth_date,
            Clients.sex,
            Optionals.city,
            Optionals.name.label("optional_name"),
            OptionalPurchase.price,
            OptionalPurchase.discount,
            OptionalPurchase.total,
            OptionalPurchase.purchase_date,
            OptionalPurchase.place_of_purchase,
            OptionalPurchase.source,
            OptionalPurchase.payment_method
        )
        .join(ClientGroup, ClientGroup.id_clients == Clients.id_clients)
        .join(OptionalPurchase, OptionalPurchase.client_id == Clients.id_clients, isouter=True)
        .join(Optionals, OptionalPurchase.id_optionals == Optionals.id_optional, isouter=True)
        .where(ClientGroup.id_group == id_group)
    )

    rows = result.fetchall()

    # Procesar datos para agrupar opcionales por ciudad y cliente
    clients_data = {}
    
    for row in rows:
        client_key = (
            row.paternal_surname, row.mother_surname, row.first_name,
            row.second_name, row.birth_date, row.sex
        )
        
        # Si el cliente no existe en el diccionario, inicializar su estructura
        if client_key not in clients_data:
            clients_data[client_key] = {
                "paternal_surname": row.paternal_surname,
                "mother_surname": row.mother_surname,
                "first_name": row.first_name,
                "second_name": row.second_name,
                "birth_date": row.birth_date,
                "sex": row.sex,
                "city_optionals": {}  # Diccionario para agrupar opcionales por ciudad
            }
        
        # Agrupar los opcionales por ciudad
        city = row.city
        if city not in clients_data[client_key]["city_optionals"]:
            clients_data[client_key]["city_optionals"][city] = []
        
        # Agregar la información del opcional en la ciudad correspondiente
        clients_data[client_key]["city_optionals"][city].append({
            "optional_name": row.optional_name,
            "price": row.price,
            "discount": row.discount,
            "total": row.total,
            "purchase_date": row.purchase_date,
            "place_of_purchase": row.place_of_purchase,
            "source": row.source,
            "payment_method": row.payment_method
        })

    # Convertir el diccionario de clientes en una lista para la salida final
    output_data = list(clients_data.values())
    return output_data