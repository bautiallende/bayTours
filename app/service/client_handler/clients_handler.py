from sqlalchemy.ext.asyncio import AsyncSession
from .base_handler import BaseHandler
from app.models.clients import Clients
from app.service import clients as clients_service
from app.service import client_group as client_group_functions
from app.crud import clients as clients_functions
import pandas as pd 
import numpy as np
from uuid import uuid4
from datetime import datetime
from app.service.optional_purchase import create_optional_purchase
from app.service import clients_room as client_room_services




class ClientsHandler(BaseHandler):
         
    async def create(self, db:AsyncSession, df: pd.DataFrame, group_number:str, circuit_name:str):
        df = df.replace(np.nan, None)

        room_type = None
        old_room_type = None


        for _, row in df.iterrows():
            
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
                    "nationality": row['NACIONALIDAD'],
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
                if row.get('PAQUETE 4 2024', None):
                    print(f"Paquete: {row['PAQUETE 4 2024']}")

                    packete = row['PAQUETE 4 2024'].split(' ')[1]
                    print(f"Packete: {packete}")

                    if birth_date:
                        # Obtener la fecha actual
                        today = datetime.now().date()
                        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
                        print(f"Age: {age}")

                    response = await create_optional_purchase(db=db, group_number=group_number, id_clientes=id_cliente, packages=packete, circuit_name=circuit_name, age=age)
                
                
                # Creamos y guardamos las habitaciones de los clientes
                await client_room_services.create_client_room(db=db, client_id=id_cliente, group_id=group_number)
                
            if row.get('TIPO DE HABITACIÓN', None):
                room_type = row['TIPO DE HABITACIÓN']
                old_room_type = room_type
            elif not row.get('TIPO DE HABITACION', None) and old_room_type:
                room_type = old_room_type
                old_room_type = None  

            response = await client_group_functions.new_client_group(db=db, client_id=id_cliente, id_group=group_number, packages=packete, room_type=room_type)

            