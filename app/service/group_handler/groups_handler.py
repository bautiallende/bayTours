from sqlalchemy.ext.asyncio import AsyncSession
from .base_handler import BaseHandler
import pandas as pd
from app.models.group import Group
from datetime import datetime
from app.crud import group as group_functions
from app.service import clients as clients_services
from app.service import circuits as circuit_services
from app.service import days as days_services
from app.crud import client_group as client_group_functions




class GroupsHandler(BaseHandler):
    async def create_group(self, db:AsyncSession, id_group:str, pax:int, circuit_name:str, flight_data: dict|None = None):
        
        group_data = await group_functions.get_group(db, id_group)

        if not group_data:

            # Obtenemos los datos del circuito
            circuit_data = await circuit_services.get_circuit_id(db=db, name=circuit_name)
                    
            group_data = Group(**{
                "id_group":id_group,
                "status": "new",
                "start_date": flight_data.get("start_date", None) if flight_data else None,
                "end_date": flight_data.get("end_date", None) if flight_data else None,
                "initial_flight": flight_data.get("initial_flight", None) if flight_data else None,
                "end_flight": flight_data.get("end_flight", None) if flight_data else None,
                "PAX": int(pax),
                "circuit": circuit_data.id_circuit
            })



            

            # Guardar en la base de datos
            result = await group_functions.create_group(db=db, group_data=group_data)

            print(f"Grupo creado: {result.id_group} con llegada el {result.start_date}  y salida el {result.end_date} ")

            if result.start_date and result.end_date:
                
                result = await days_services.new_group(db=db, id_group=id_group, arrival_date=result.start_date, departure_date=result.end_date, id_circuit=circuit_data.id_circuit)
            
            return



    async def calculate_datetime(self, date_str: str) -> datetime:
        # Parsear la fecha y hora sin el año
        date = datetime.strptime(date_str, "%d-%m %H:%M")

        # Asignar el año correcto
        now = datetime.now()
        date = date.replace(year=now.year)
        
        # Si la fecha ya pasó este año, se asume que es para el siguiente año
        if date < now:
            date = date.replace(year=now.year + 1)
        
        return date
    

    async def get_tabla_group(self, db: AsyncSession, id_grupo: str = None, bus_company: str = None, 
                          guide_name: str = None, operaciones_name: str = None, 
                          status: str = None, assistant_name: str = None, 
                          has_qr: bool = None, current_city: str = None, current_hotel: str = None, sort_by: str = None, order: str = None):
        
        groups = await group_functions.get_tabla_group(db=db, id_grupo=id_grupo, bus_company=bus_company, guide_name=guide_name, operaciones_name=operaciones_name, status=status, 
                                                       assistant_name=assistant_name, has_qr=has_qr, current_city=current_city, current_hotel=current_hotel, sort_by=sort_by, order=order)

        print(f'grupos: {groups}')

        return groups
        


    async def get_group_data(self, db:AsyncSession, id_group:str, table:str):
        group_data = (await group_functions.get_tabla_group(db=db, id_grupo=id_group))[0]

        print(f'grupos: {group_data}')

        if table == 'clientes':
            table_data = await clients_services.get_clients_by_group_id(db=db, id_group=id_group)
        
        elif table == 'opcionales':
            table_data = await client_group_functions.get_grouped_client_data(db=db, id_group=id_group) 

        elif table == '':
            pass
        
        elif table == '':
            pass
        
        elif table == '':
            pass
        
        else:
            table_data = None

        


        return group_data, table_data