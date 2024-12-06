from sqlalchemy.ext.asyncio import AsyncSession
from app.models.client_group import ClientGroup
from sqlalchemy.future import select
from app.models.optional_purchase import OptionalPurchase
from app.models.activity import Activity
from app.models.clients import Clients
from app.models.optionals import Optionals
from app.models.days import Days
from datetime import timedelta, datetime


async def create_group(db:AsyncSession, group_data:ClientGroup):
    db.add(group_data)
    db.commit()
    db.refresh(group_data)
    return group_data



async def get_grouped_client_data(db: AsyncSession, id_group:str):
    # Consulta principal que obtiene datos básicos de cliente y opcionales comprados
    result = db.execute(
        select(
            Clients.id_clients,
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
            OptionalPurchase.payment_method,
            Days.id
        )
        .join(ClientGroup, ClientGroup.id_clients == Clients.id_clients)
        .join(OptionalPurchase, OptionalPurchase.client_id == Clients.id_clients, isouter=True)
        .join(Activity, OptionalPurchase.id_activity == Activity.id, isouter=True)
        .join(Days, Activity.id_days == Days.id, isouter=True)
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
        
        birth_date = row.birth_date  # reemplaza row.birth_date con el valor real
        if birth_date:
            age = datetime.now().year - birth_date.year - ((datetime.now().month, datetime.now().day) < (birth_date.month, birth_date.day))
        else:
            age = ''

        # Si el cliente no existe en el diccionario, inicializar su estructura
        if client_key not in clients_data:
            clients_data[client_key] = {
                "id_clients": row.id_clients,
                "paternal_surname": row.paternal_surname,
                "mother_surname": row.mother_surname,
                "first_name": row.first_name,
                "second_name": row.second_name,
                "age": age,
                "sex": row.sex,
                "day_optionals": {}  # Diccionario para agrupar opcionales por ciudad
            }
        
        # Agrupar los opcionales por ciudad
        city = row.id
        if city not in clients_data[client_key]["day_optionals"]:
            clients_data[client_key]["day_optionals"][city] = []
        
        # Agregar la información del opcional en la ciudad correspondiente
        clients_data[client_key]["day_optionals"][city].append({
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
    group_data = list(clients_data.values())
    
    # Obtener datos de `days` para crear el `itinerary`
    itinerary_result = db.execute(
        select(Days.city, Days.date, Days.id)
        .where(Days.id_group == id_group)
        .order_by(Days.date)
    )
    
    days_rows = itinerary_result.fetchall()
    
    # Construir `itinerary` agrupando fechas por ciudad
    itinerary = []
    current_city = None
    city_days = []
    #start_date = None
    #end_date = None


    for row in days_rows:
        if row.city != current_city:
            # Añadir la ciudad previa al itinerario si ya tenemos datos
            if current_city is not None:
                itinerary.append({
                    "city": current_city,
                    "days": city_days
                })
            # Resetear para la nueva ciudad
            current_city = row.city
            city_days = []

        # Añadir el día actual a la lista de días de la ciudad
        city_days.append({
            "id": row.id,
            "date": row.date.strftime("%d-%m-%Y")
        })

    # Añadir la última ciudad al itinerario
    if current_city is not None:
        itinerary.append({
            "city": current_city,
            "days": city_days
        })



    # for row in days_rows:
    #     if row.city != current_city:
    #         # Añadir la ciudad previa al itinerario si ya tenemos datos
    #         if current_city is not None:
    #             itinerary.append({
    #                 "city": current_city,
    #                 "start_date": start_date.strftime("%d-%m-%Y"),
    #                 "end_date": end_date.strftime("%d-%m-%Y") 
    #             })
    #         # Resetear para la nueva ciudad
    #         current_city = row.city
    #         start_date = row.date
    #         end_date = row.date + timedelta(days=1)
    #     else:
    #         # Extender la estadía en la ciudad actual
    #         end_date = row.date + timedelta(days=1)

    # # Añadir la última ciudad al itinerario
    # if current_city is not None:
    #     itinerary.append({
    #         "city": current_city,
    #         "start_date": start_date.strftime("%d-%m-%Y"),
    #         "end_date": end_date.strftime("%d-%m-%Y")
    #     })

    
    #return group_data, itinerary
    return {
        "table_data": group_data,
        "itinerary": itinerary
    }