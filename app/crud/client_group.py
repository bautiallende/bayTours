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



async def get_grouped_client_data(db: AsyncSession, id_group:str, filters: dict = None):
    # Consulta principal que obtiene datos básicos de cliente y opcionales comprados
    query = select(
            Clients.id_clients,
            Clients.paternal_surname,
            Clients.mother_surname,
            Clients.first_name,
            Clients.second_name,
            Clients.birth_date,
            Clients.sex,
            Optionals.city,
            Optionals.name.label("optional_name"),
            OptionalPurchase.id_activity,
            OptionalPurchase.id_optionals,
            OptionalPurchase.price,
            OptionalPurchase.discount,
            OptionalPurchase.total,
            OptionalPurchase.purchase_date,
            OptionalPurchase.place_of_purchase,
            OptionalPurchase.source,
            OptionalPurchase.payment_method,
            Days.id
        ).join(
            ClientGroup, ClientGroup.id_clients == Clients.id_clients).join(
                OptionalPurchase, OptionalPurchase.client_id == Clients.id_clients, isouter=True
                ).join(
                    Activity, OptionalPurchase.id_activity == Activity.id, isouter=True
                    ).join(
                        Days, Activity.id_days == Days.id, isouter=True
                        ).join(
                            Optionals, OptionalPurchase.id_optionals == Optionals.id_optional, isouter=True
                            ).where(ClientGroup.id_group == id_group)
    


    # Aplicar filtros
    if filters:
        if "passengers" in filters and filters["passengers"]:
            query = query.filter(Clients.id_clients.in_(filters["passengers"]))
        # Filtro por rango de edad
        if "min_age" in filters and "max_age" in filters:
            current_year = datetime.now().year
            min_birth_year = current_year - int(filters["max_age"])  # Edad máxima corresponde al año mínimo
            max_birth_year = current_year - int(filters["min_age"])  # Edad mínima corresponde al año máximo
            print(f"{min_birth_year}-01-01", f"{max_birth_year}-12-31")
            query = query.filter(
                Clients.birth_date.between(f"{min_birth_year}-01-01", f"{max_birth_year}-12-31")
            )
        elif "min_age" in filters:
            current_year = datetime.now().year
            max_birth_year = current_year - int(filters["min_age"])
            print(f"{max_birth_year}-12-31")
            query = query.filter(Clients.birth_date <= f"{max_birth_year}-12-31")
        elif "max_age" in filters:
            current_year = datetime.now().year
            min_birth_year = current_year - int(filters["max_age"])
            print(f"{min_birth_year}-01-01")
            query = query.filter(Clients.birth_date >= f"{min_birth_year}-01-01")

        # Filtro por sexo
        if "sex" in filters and filters["sex"]:
            #sex = "M" if filters["sex"].lower() in ["masculino", "m"] else "F"
            query = query.filter(Clients.sex == filters["sex"])

        # Filtro por ciudad
        if "city" in filters and filters["city"]:
            if isinstance(filters["city"], str):
                filters["city"] = [filters["city"]]  # Convertir a lista si es un string único
            query = query.filter(Optionals.city.in_(filters["city"]))

        # Filtro por actividades
        if "activity_id" in filters and filters["activity_id"]:
            if isinstance(filters["activity_id"], str):
                filters["activity_id"] = [filters["activity_id"]]
            query = query.filter(Optionals.id_optional.in_(filters["activity_id"]))

        if "place_of_purchase" in filters and filters["place_of_purchase"]:
            print(f"Place of purchase: {filters['place_of_purchase']}")
            query = query.filter(OptionalPurchase.place_of_purchase.ilike(f"%{filters['place_of_purchase']}%"))
        
        if "payment_method" in filters and filters["payment_method"]:
            print(f"Payment method: {filters['payment_method']}")
            query = query.filter(OptionalPurchase.payment_method.ilike(f"%{filters['payment_method']}%"))


    rows = db.execute(query).fetchall()

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
            "id_activity": row.id_activity,
            "id_optionals": row.id_optionals,
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
    
    #return group_data, itinerary
    return {
        "table_data": group_data,
        "itinerary": itinerary
    }