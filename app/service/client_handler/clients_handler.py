from sqlalchemy.ext.asyncio import AsyncSession
from .base_handler import BaseHandler
import copy
from uuid import uuid4
from app.models.clients import Clients
from app.service import clients as clients_service
from app.service import client_group as client_group_functions
from app.crud import clients as clients_functions
import pandas as pd 
import pycountry 
import numpy as np
from uuid import uuid4
from datetime import datetime
from app.service.optional_purchase import create_optional_purchase
from app.service import clients_room as client_room_services
from app.service import days as days_service
from app.schemas.clients import ClientCreate, ClientUpdate
from app.crud import client_group as client_group_functions
import json
from app.service import client_group as client_group_service

NATIONALITY_MAP = {
    'MEXICANA': 'MX',
    'MEXICANO':  'MX',
    'MEXICO':    'MX',
    'ESTADOUNIDENSE': 'US',
    'ESTADOS UNIDOS': 'US',
    # …añade las que necesites
}

def normalize_nationality(raw):
    if not raw:
        return None
    key = raw.strip().upper()
    # primer paso: lookup exacto en tu mapeo
    if key in NATIONALITY_MAP:
        return NATIONALITY_MAP[key]
    # si no, intentar buscar en pycountry (por nombre oficial o común)
    for country in pycountry.countries:
        # comparo mayúsculas para name y names comunes
        if key in country.name.upper():
            return country.alpha_2
    # fallback: devolver el raw (o None)
    return None


class ClientsHandler(BaseHandler):
         
    async def create(self, db:AsyncSession, df: pd.DataFrame, group_number:str, circuit_name:str):
        df = df.replace(np.nan, None)

        room_type = None
        old_room_type = None
        id_common_room = None
        id_old_room = None
        new = False


        for _, row in df.iterrows():
            
            id_cliente = None
            packete = None
            
            if not row['APELLIDO PATERNO'] or not row['PRIMER NOMBRE']:
                continue

            # Evitar almacenar el encabezado como si fuera una fila
            if isinstance(row['APELLIDO PATERNO'], str) and row['APELLIDO PATERNO'].lower() == 'apellido paterno':
                continue
            
            

            print(f'habitacion encontrada: {row.get('TIPO DE HABITACIÓN', None):}')
            print(f'habitacion a asignar: {room_type}')
            print(f'habitacion anterior: {old_room_type}')

            # Verificamos si el cliente ya existe en la base de datos
            existing_client = await clients_service.get_clients(
                db=db,
                paternal_surname=row['APELLIDO PATERNO'],
                first_name=row['PRIMER NOMBRE'], 
                passaport=row.get('PASAPORTE'), 
                birth_date=datetime.strptime(row['FECHA NACIMIENTO'], '%d-%m-%Y') if row['FECHA NACIMIENTO'] else None
                )
            
            if existing_client:
                id_cliente = existing_client.id_clients
                print(f"Cliente encontrado: {id_cliente}")
                
            
            else:
                id_cliente = str(uuid4())
                
                birth_date = datetime.strptime(row['FECHA NACIMIENTO'], '%d-%m-%Y') if row['FECHA NACIMIENTO'] else None

                client_data = Clients(**{
                    "id_clients":id_cliente,
                    "paternal_surname": row['APELLIDO PATERNO'],
                    "mother_surname": row['APELLIDO MATERNO'],
                    "first_name": row['PRIMER NOMBRE'],
                    "second_name": row['SEGUNDO NOMBRE'],
                    "birth_date": birth_date,
                    "sex": row['SEXO'],
                    "nationality": normalize_nationality(row['NACIONALIDAD']),
                    "passport": row['PASAPORTE'],
                    "vtc_passport": (datetime.strptime(row['VENCIMIENTO DE PASAPORTE'], '%d-%m-%Y')
                                        if isinstance(row['VENCIMIENTO DE PASAPORTE'], str) else row['VENCIMIENTO DE PASAPORTE']),
                    "phone": row.get('TELEFONO', None),  # Agregar columnas adicionales según sea necesario
                    "mail": row.get('EMAIL', None)       # Si no existen, se asigna None
                })

                # aca debemos crear la funcion que llama al handler de create group y 
                # pasarle el client_id y el grupo_id (lo tenemos en paramestros) hay que ver si 
                # tambbien le pasamos los paquetes
                
                client = clients_functions.create_client(db=db, client=client_data)
                print(f"Nuevo cliente creado: {client.id_clients}")

                
            # hay que crear tmabien la funcion para las habitaciones. 
            if row.get('PAQUETE 4 2024', None) and id_cliente:
                print(f"Paquete: {row['PAQUETE 4 2024']}")

                packete = row['PAQUETE 4 2024'].split(' ')[1]
                print(f"Packete: {packete}")

                if birth_date:
                    # Obtener la fecha actual
                    today = datetime.now().date()
                    age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
                    print(f"Age: {age}")

                response = await create_optional_purchase(db=db, group_number=group_number, id_clientes=id_cliente, packages=packete, circuit_name=circuit_name, age=age)
            
                
            if row.get('TIPO DE HABITACIÓN', None):
                room_type = row['TIPO DE HABITACIÓN']
                old_room_type = room_type
                days_data = await days_service.get_all(db=db, id_group=group_number)
                current_room_ids_by_day = { day.id: str(uuid4()) for day in days_data}
                id_old_room = id_common_room
                new = True
            elif not row.get('TIPO DE HABITACION', None) and old_room_type:
                room_type = old_room_type
                old_room_type = None 
                id_common_room = id_old_room
                id_old_room = None 
                new = False
            pax_number = None
            if row.get('PAX', None):
                pax_number = row['PAX']

            # Creamos y guardamos las habitaciones de los clientes
            await client_room_services.create_client_room(db=db, client_id=id_cliente, group_id=group_number, room_ids_by_day=current_room_ids_by_day, new=new)

            response = await client_group_service.new_client_group(db=db, client_id=id_cliente, id_group=group_number, packages=packete, room_type=room_type, pax_number=pax_number)

    async def update_client(self, db:AsyncSession, client_data:ClientUpdate):
        client_group = await client_group_functions.get_client_group_by_id_client(db=db, id_clients=client_data.id_clients)
    
        if not client_group:
            return {"message": "No se encontro el cliente"}
        
        update_group = False

        if client_group.shown != client_data.shown and client_data.shown == 0:
            from app.crud import clients_room as clients_room_functions
            from app.crud import room_composition as room_composition_functions

            #client_group.shown = client_data.shown
            update_group = True

            client_rooms = await clients_room_functions.get_by_client_id(db=db, client_id=client_data.id_clients)
            for client_room in client_rooms:
                room_composition = await room_composition_functions.get_room_composition_by_id(db=db, room_composition_id=client_room.room_composition_id)
                if room_composition:
                    room_composition.status = "Under review"
                    room_composition.comments = json.dumps(f"Cliente {client_data.first_name} {client_data.paternal_surname} eliminado de la lista de pasajeros (no show)")
                    await room_composition_functions.update(db=db, room_data=room_composition)
        
        if client_group.packages != client_data.packages:
            update_group = True
        
        if client_group.room_type != client_data.room_type:
            update_group = True
        
        if update_group:
            await client_group_service.update_client_group(db=db, data=client_data)
        
        

        updated_client = await super().update(db=db, client_data=client_data)
        return updated_client
        