from .base_handler import BaseHandler
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.packages import search_package
from app.models.optional_purchase import OptionalPurchase
from app.service.optionals import get_optionals
from datetime import datetime
from app.service import circuits as circuit_services
from app.service import activity as activity_services
from app.schemas.optionals_purchase import OptionalsPurchase
from app.crud import optional_purchase as optional_purchase_functions
from app.service import group as group_services


class OptionalPurchaseHandler(BaseHandler):

    async def create(self, db:AsyncSession, group_number:str, id_clientes:str, packages:str, age:int, circuit_name:str = None, id_circuit:int = None):
        try:
            if not circuit_name and not id_circuit:
                return "No se ha proporcionado el nombre del circuito o el id del circuito"
            
            if circuit_name and not id_circuit:
                circuit_data = await circuit_services.get_circuit_id(db=db, name=circuit_name)
                id_circuit = circuit_data.id

                print(f"Creating circuit: {circuit_data}")
                print(f"Creating circuit: {circuit_data.id}")
                print(f'package: {packages}')

            # configurar los paquetes de los clientes
            # con el numero de grupo y paquetes debemos buscar en la tabla de paquetes
            # cuales son lo que estan incluidos con el el tipo de paquetes y los registramos 
            package_data = await search_package(db=db, id_circuit=id_circuit, packages=packages)

            for p in package_data:
                print(f'package_data: \n{vars(p)}')

            print('\n--------------------------------\n\n')
            for p in package_data:
                print(f'el paquete esta compuesto de la siguiente manera: \n{vars(p)}\n\n')
                activity_data = (await activity_services.get_by_group_id(db=db, id_group=group_number, id_optional=p.id_optional))[0]


                optional_data =  (await get_optionals(db=db, id_stage=p.id_stage, id_optional=p.id_optional))[0]

                print(f'Optional data: \n{optional_data}\n')
                print(f'activity_data: \n{activity_data}\n')
                
                price = None
                if age:
                    if age >= 12:
                        price = optional_data.adult_price
                    else:
                        price = optional_data.minor_price

                optional_purchase = OptionalPurchase(**{
                    'id_group': group_number,
                    'client_id': id_clientes, 
                    'id_activity': activity_data.id, 
                    'id_optionals': p.id_optional, 
                    'status': 'New',
                    'price':price,
                    'discount':None,
                    'total': price,
                    'purchase_date': datetime.now(),
                    'updated_purchase_date':datetime.now(),
                    'place_of_purchase':'before_trip',
                    'source':'Rooming List',
                    'payment_method':'Cash'                    
                })
                print(f'el opcional a guardar es: \n{vars(optional_purchase)}\n\n')

                db.add(optional_purchase)
            db.commit()
        except Exception as e:
            print(f"Error: {str(e)}")
            return str(e)


    
    async def create_one(self, db:AsyncSession, optional_purchase_data:OptionalsPurchase):
        
        group_data =  await group_services.get_group(db=db, id_group=optional_purchase_data.id_group)

        if not group_data:
            return "El grupo no existe"
        
        optional_purchase_data_sql = OptionalPurchase(**optional_purchase_data.dict())

        if optional_purchase_data.discount:
            discount_factor = 1 + (float(optional_purchase_data_sql.discount) / 100)
            optional_purchase_data_sql.total = optional_purchase_data_sql.price / discount_factor
        else: 
            optional_purchase_data_sql.total = optional_purchase_data_sql.price 
        
        optional_purchase_data_sql.purchase_date = datetime.now()
        optional_purchase_data_sql.updated_purchase_date = datetime.now()
        optional_purchase_data_sql.status = 'New'

        result = await optional_purchase_functions.create_one(db=db, optional_purchase_data=optional_purchase_data_sql)
        return result



    async def update(self, db:AsyncSession, optional_purchase_data:OptionalsPurchase):
        optional_data = await optional_purchase_functions.get_one(db=db, id_group=optional_purchase_data.id_group, client_id=optional_purchase_data.client_id, id_activity=optional_purchase_data.id_activity)

        if not optional_data:
            return "Usuario no encontrado"
        
        optional_data.id_optionals = optional_purchase_data.id_optionals
        optional_data.status = 'Updated'
        optional_data.price = optional_purchase_data.price
        optional_data.discount = optional_purchase_data.discount

        if optional_purchase_data.discount:
            discount_factor = (float(optional_purchase_data.discount) / 100)
            optional_data.total = optional_data.price - (optional_purchase_data.price * discount_factor)

        else: 
            optional_data.total = optional_purchase_data.price 

        optional_data.updated_purchase_date = datetime.now()
        optional_data.place_of_prechase = optional_purchase_data.place_of_purchase
        optional_data.source = optional_purchase_data.source
        optional_data.payment_method = optional_purchase_data.payment_method

        result = await optional_purchase_functions.update_one(db=db, optional_purchase_data=optional_data)
        return result


    
    async def delete(self, db:AsyncSession, id_group:str, client_id:str, id_activity:str):
        optional_data = await optional_purchase_functions.get_one(db=db, id_group=id_group, client_id=client_id, id_activity=id_activity)

        if not optional_data:
            return "Usuario no encontrado"
        
        result = await optional_purchase_functions.delete(db=db, optional_purchase_data=optional_data)
        return result

            

            
