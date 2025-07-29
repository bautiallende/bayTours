from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import asc, desc
from sqlalchemy.orm import aliased
from app.schemas.group import GroupCreate
from app.models.group import Group
from app.models.transport import Transport
from app.models.transport_company import TransportCompany
from app.models.assistant import Assistant
from app.models.operations import Operations
from app.models.hotel import Hotel
from app.models.guides import Guides
from app.models.hotel_reservation import HotelReservation
from app.models.days import Days
from app.models.circuits import Circuit
from app.models.responsables_hotels import ResponsablesHotels
from app.models.cities import City
from datetime import datetime
from app.models.packages import Packages



async def create_group(db: AsyncSession, group_data: Group):    
    db.add(group_data)
    db.commit()
    db.refresh(group_data)
    return group_data


async def update_group(db: AsyncSession, group_data: Group):
    db.commit()
    db.refresh(group_data)
    return group_data



async def get_group(db: AsyncSession, id_group: str):
    '''Gets group by id_group'''
    result =  db.execute(select(Group).filter(Group.id_group == id_group))
    return result.scalars().first()


async def get_tabla_group(db: AsyncSession, id_grupo: str = None, bus_company: str = None, 
                          guide_name: str = None, operaciones_name: str = None, 
                          status: str = None, assistant_name: str = None, 
                          has_qr: bool = None, current_city: str = None, current_hotel: str = None, sort_by: str = None, order: str = "asc"):

    print(f"valor del id_group: {id_grupo}")
    print(f"valor del bus: {bus_company}")
    # Alias para la tabla de hoteles
    HotelAlias = aliased(Hotel)
    

    query = select(
        Group.id_group,
        TransportCompany.name.label('bus_company'),
        Transport.bus.label('bus_code'),
        Guides.name.label('guide_name'),
        Guides.surname.label('guide_surname'),
        Operations.name.label('operaciones_name'),
        Operations.surname.label('operaciones_surname'),
        Group.status,
        Group.start_date,
        Group.initial_flight,
        Group.datetime_initial_flight,
        Group.end_date,
        Group.end_flight,
        Group.datetime_end_flight,
        Assistant.name.label('nombre_asistente'),
        Assistant.surname.label('apellido_asistente'),
        Group.PAX,
        Group.QR, 
        ResponsablesHotels.name.label('nombre_responsable_hotels'),
        ResponsablesHotels.surname.label('apellido_responsable_hotels'),
        Circuit.name.label('nombre_circuito')
        ).join(Guides, Group.id_guide == Guides.id_guide, isouter=True
        ).join(Transport, Group.id_transport == Transport.id_transport, isouter=True
        ).join(TransportCompany, Transport.company_id == TransportCompany.company_id, isouter=True
        ).join(ResponsablesHotels, ResponsablesHotels.id_responsible_hotels == Group.id_responsible_hotels, isouter=True
        ).join(Operations, Group.id_operations == Operations.id_operation, isouter=True
        ).join(Assistant, Group.id_assistant == Assistant.id_assistant, isouter=True
        ).join(Circuit, Group.circuit == Circuit.id, isouter=True
               ).distinct(Group.id_group)

    print(f"valor del id_group: {id_grupo}")
    # Aplicar filtros opcionales
    if id_grupo and id_grupo is not None and id_grupo != 'None':
        query = query.filter(Group.id_group.ilike(f"%{id_grupo}%"))  # Búsqueda parcial por ID de grupo
    if bus_company:
        query = query.filter(TransportCompany.name == bus_company)
    if guide_name:
        query = query.filter(Guides.name == guide_name)
    if operaciones_name:
        query = query.filter(Operations.name == operaciones_name)
    if status:
        query = query.filter(Group.status == status)
    if assistant_name:
        query = query.filter(Assistant.name == assistant_name)
    if has_qr is not None:
        query = query.filter(Group.QR.isnot(None) if has_qr else Group.QR.is_(None))
   
    
    print(f'sort_by: {sort_by}')
    print(f'order by: {order}')
    print(f'query antes de ser ordenada: {query}')
    # Aplicar ordenamiento
    if sort_by:
        sort_column = {
            "id_grupo": Group.id_group,
            "bus_company": TransportCompany.name,
            "guide_name": Guides.name,
            "operaciones_name": Operations.name,
            "status": Group.status,
            "start_date": Group.start_date,
            "end_date": Group.end_date,
            "nombre_asistente": Assistant.name,
            "PAX": Group.PAX,
            "QR": Group.QR,
        }.get(sort_by)

        print(f'sort_column: {sort_column}')

        if sort_column:
            query = query.order_by(asc(sort_column) if order == "asc" else desc(sort_column))

    print(query)
    # Ejecutar la consulta con filtros aplicados
    result = db.execute(query)
    groups = result.fetchall()

    # Obtener la fecha actual
    current_date = datetime.now().date()

    group_data = []
    
    for group in groups:
        # Convertir start_date y end_date a formato 'date' para la comparación
        start_date = group.start_date if group.start_date else None
        end_date = group.end_date if group.end_date else None

        start_date = start_date.date() if isinstance(start_date, datetime) else start_date
        end_date = end_date.date() if isinstance(end_date, datetime) else end_date

        if current_date < start_date:
            # El tour no ha comenzado
            first_stage = db.execute(
                select(City.name.label("city_name"),
                    HotelAlias.hotel_name.label("hotel_name"))
                .join(Days, Days.id_city == City.id)
                .join(HotelReservation,
                    HotelReservation.id_group == Days.id_group,
                    isouter=True)
                .join(HotelAlias,
                    HotelReservation.id_hotel == HotelAlias.id_hotel,
                    isouter=True)
                .where(Days.id_group == group.id_group)
                .order_by(Days.date.asc())
                .limit(1)
            )
            result = first_stage.fetchone()
            
            if result:
                city, hotel_name = result
            else:
                city, hotel_name = "Sin información", "Sin información"

        elif start_date <= current_date <= end_date:
            # El tour está en progreso
            current_location = db.execute(
                select(City.name.label("city_name"),
                    HotelAlias.hotel_name.label("hotel_name"))
                .join(Days, Days.id_city == City.id)
                .join(HotelReservation,
                    HotelReservation.id_day == Days.id,
                    isouter=True)
                .join(HotelAlias,
                    HotelReservation.id_hotel == HotelAlias.id_hotel,
                    isouter=True)
                .where(Days.id_group == group.id_group, Days.date <= current_date)
                .order_by(Days.date.desc())
                .limit(1)
            )
            result = current_location.fetchone()

            if result:
                city, hotel_name = result
            else:
                city, hotel_name = "Sin información", "Sin información"

        else:
            # El tour ya ha terminado
            city = "Finalizado"
            hotel_name = "Finalizado"


         # Convertir start_date y end_date a un formato más amigable
        formatted_start_date = group.start_date.strftime("%d/%m/%Y %H:%M") if group.start_date else None
        formatted_end_date = group.end_date.strftime("%d/%m/%Y %H:%M") if group.end_date else None

        fotmatted_initial_flight = str(group.start_date.strftime("%d/%m %H:%M")) if group.start_date else None
        fotmatted_end_flight = str(group.end_date.strftime("%d/%m %H:%M")) if group.end_date else None

        # Agregar los datos del grupo y la ubicación actual a la lista
        group_data.append({
            "id_group": group.id_group,
            "bus_company": (group.bus_company + ' - ' + group.bus_code) if group.bus_company and group.bus_code else group.bus_company,
            "guide_name": (group.guide_name + ' ' + group.guide_surname) if group.guide_name and group.guide_surname else group.guide_name,
            "operaciones_name": (group.operaciones_name + ' ' + group.operaciones_surname) if group.operaciones_name and group.operaciones_surname else group.operaciones_name,
            "status": group.status,
            "start_date": formatted_start_date,
            "start_flight": fotmatted_initial_flight + " (" + group.initial_flight + ")" if group.initial_flight != None and fotmatted_initial_flight != None else None ,
            "end_date": formatted_end_date,
            "end_flight": fotmatted_end_flight + " (" + group.end_flight + ")" if group.end_flight != None and fotmatted_end_flight != None else None ,
            "nombre_asistente": (group.nombre_asistente + " " + group.apellido_asistente) if group.nombre_asistente and group.apellido_asistente else group.nombre_asistente,
            "PAX": group.PAX,
            "QR": group.QR,
            "ciudad_actual": city,
            "hotel_actual": str(hotel_name) if hotel_name else '-', 
            "id_responsible_hotels":(group.nombre_responsable_hotels + ' ' + group.apellido_responsable_hotels) if group.nombre_responsable_hotels and group.apellido_responsable_hotels else group.nombre_responsable_hotels,
            "nombre_circuito": group.nombre_circuito,   
        })
    
    # Aplicar filtros `current_city` y `current_hotel` en el listado final
    if current_city:
        group_data = [group for group in group_data if group['ciudad_actual'] == current_city]
    if current_hotel:
        group_data = [group for group in group_data if group['hotel_actual'] == current_hotel]


    if sort_by in ["ciudad_actual", "hotel_actual"]:
        reverse_order = (order == "desc")
        group_data.sort(key=lambda x: x.get(sort_by, ""), reverse=reverse_order)

    return group_data




async def get_filter_options(db: AsyncSession):
    # Obtener todas las opciones de hoteles, guías, compañías de bus, operaciones y asistentes
    result = {}

    # Opciones de hotel
    hotels = db.execute(select(Hotel.hotel_name).distinct())
    result['hotels'] = [row.hotel_name for row in hotels.fetchall()]

    # Opcionales de ciudades
    cities_stmt = (
        select(City.name)
        .join(Days, Days.id_city == City.id)
        .distinct()
        .order_by(City.name)
    )
    cities_rows = (db.execute(cities_stmt)).fetchall()
    result["cities"] = [row.name for row in cities_rows]


    # Opciones de guías
    guides = db.execute(select(Guides.name).distinct())
    result['guides'] = [row.name for row in guides.fetchall()]

    # Opciones de compañías de bus
    transport = db.execute(select(TransportCompany.name).distinct())
    result['bus_companies'] = [row.name for row in transport.fetchall()]

    # Opciones de operaciones
    operations = db.execute(select(Operations.name).distinct())
    result['operations'] = [row.name for row in operations.fetchall()]

    # Opciones de asistentes
    assistants = db.execute(select(Assistant.name).distinct())
    result['assistants'] = [row.name for row in assistants.fetchall()]

    # Opciones de estados (ej. 'new', 'in_progress', etc.)
    statuses = db.execute(select(Group.status).distinct())
    result['statuses'] = [row.status for row in statuses.fetchall()]

    return result




async def get_posible_packages(db: AsyncSession, id_group:str):
    
    query = select(Packages.package_number
                   ).join(Group, Group.circuit == Packages.id_circuit
                          ).group_by(Packages.package_number).filter(Group.id_group == id_group)
    result = db.execute(query)

    return result.scalars().all()