import pandas as pd
from .base_handler import BaseHandler
from sqlalchemy.ext.asyncio import AsyncSession
from app.service import clients
from app.service import group
from datetime import datetime
from dateutil.parser import parse



class RoomingListHandler(BaseHandler):

    async def create(self, db:AsyncSession ,df: pd.DataFrame):   
        # Extraer la primera fila para el número de grupo y nombre del circuito
        first_row = df.iloc[0, 0]
        group_number, circuit_name = extract_group_and_circuit(first_row)
        
        print(f"Grupo: {group_number}, Circuito: {circuit_name}")
        
        # Identificar el índice donde empieza la sección de vuelos
        flights_start_idx = df[df.iloc[:, 0] == "AEROLÍNEA"].index[0]
        flights_end_idx = df[df.iloc[:, 0] == "LOC. AEROLINEA"].index[0]
        
        # Extraer la información de vuelos
        flights_df = df.iloc[flights_start_idx+1:flights_end_idx, :].dropna(how='all', axis=1)
        flights_df.columns = df.iloc[flights_start_idx, :].dropna()  # Asignar nombres de columnas
        print("Datos de Vuelos:")
        print(flights_df)
        
        # Identificar el índice donde empieza la sección de pasajeros
        passengers_start_idx = df[df.iloc[:, 0] == "PAX"].index[0]
        
        # Extraer la información de pasajeros
        passengers_df = df.iloc[passengers_start_idx+1:, :].dropna(how='all', axis=1)
        passengers_df.columns = df.iloc[passengers_start_idx, :].dropna()  # Asignar nombres de columnas
        print("Datos de Pasajeros:")
        print(passengers_df.head())  # Muestra las primeras filas para verificar
        
        # Calcular el número total de pasajeros (PAX)
        pax_total = passengers_df['PAX'].count()-1
        print(f"Total de PAX: {pax_total}")


        # Identificar el vuelo de llegada 
        arrival_flight =  flights_df[flights_df["SEGMENTO"] == "IDA"].iloc[-1]
        arrival_date = arrival_flight['FECHA']
        arrival_time = arrival_flight['LLEGA']
        arrival_flight_number = f"{arrival_flight['AEROLÍNEA']}{arrival_flight['VUELO']}"
        
        # Identificar el vuelo de salida (primer vuelo de regreso)
        departure_flight = flights_df[flights_df['SEGMENTO'] == 'REGRESO'].iloc[0]
        departure_date = departure_flight['FECHA']
        departure_time = departure_flight['SALE']
        departure_flight_number = f"{departure_flight['AEROLÍNEA']}{departure_flight['VUELO']}"

        # Calcular el año correcto para la fecha de llegada
        arrival_date_str = f"{arrival_date} {arrival_time}"
        arrival_datetime = await self.calculate_datetime(arrival_date_str)

        # Calcular el año correcto para la fecha de salida
        departure_date_str = f"{departure_date} {departure_time}"
        departure_datetime = await self.calculate_datetime(departure_date_str)

        print(f"VUELO LLEGADA {arrival_flight_number}, {arrival_datetime}")
        print(f"VUELO REGRESO {departure_flight_number}, {departure_datetime}")

        flight_data = {
            "start_date": arrival_datetime,
            "end_date": departure_datetime,
            "initial_flight": arrival_flight_number,
            "end_flight": departure_flight_number, 
        }


        # Creamos en nuevo grupo
        await group.new_group(db=db, id_group=group_number, flight_data=flight_data, pax = pax_total, circuit_name=circuit_name)

        # Guardamos la información de los clients
        await clients.new_group(db=db, df=passengers_df, group_number=group_number, circuit_name=circuit_name)

        # aca debemos crear la funcion para crear la informacion de la tabla grupos 

        return {
            "group_number": group_number,
            "circuit_name": circuit_name,
            "flights": flights_df,
            "passengers": passengers_df
        }





    async def calculate_datetime(self, date_str: str) -> datetime:
        try:
            # Verificar si la cadena contiene año basándonos en la longitud
            if len(date_str.split('-')) == 2:  # Solo contiene día y mes
                date = datetime.strptime(date_str, "%d-%m")
                now = datetime.now()
                date = date.replace(year=now.year)
            else:
                # Para fechas que ya incluyen el año y posiblemente la hora, usamos parse
                date = parse(date_str, dayfirst=True)

            # Si la fecha ya pasó este año, ajustar al próximo año
            now = datetime.now()
            # if date < now:
            #     date = date.replace(year=now.year + 1)

            return date
        except ValueError as e:
            raise ValueError(f"Error al procesar la fecha: {e}")





def extract_group_and_circuit(first_row):
    # Este método extrae el número de grupo y el nombre del circuito de la primera fila
    parts = first_row.split(" - ")
    group_number = parts[0].strip()
    circuit_name = parts[1].split(".")[0].strip()
    return group_number, circuit_name




