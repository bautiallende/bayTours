from .base_handler import BaseHandler
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.packages import search_package
from app.models.optional_purchase import OptionalPurchase
from app.service.optionals import get_optionals
from datetime import datetime
from app.service import circuits as circuit_services
from app.service import activity as activity_services



class OptionalPurchaseHandler(BaseHandler):

    async def create(self, db:AsyncSession, group_number:str, id_clientes:str, packages:str, circuit_name:str, age:int):
        circuit_data = await circuit_services.get_circuit_id(db=db, name=circuit_name)

        print(f"Creating circuit: {circuit_data}")
        print(f"Creating circuit: {circuit_data.id_circuit}")
        print(f'package: {packages}')

        # configurar los paquetes de los clientes
        # con el numero de grupo y paquetes debemos buscar en la tabla de paquetes
        # cuales son lo que estan incluidos con el el tipo de paquetes y los registramos 
        package_data = await search_package(db=db, id_circuit=circuit_data.id_circuit, packages=packages)

        for p in package_data:
            print(f'package_data: \n{vars(p)}')

        print('\n--------------------------------\n\n')
        for p in package_data:
            print(f'el paquete esta compuesto de la siguiente manera: \n{vars(p)}\n\n')
            activity_data = (await activity_services.get_by_group_id(db=db, id_group=group_number, id_optional=p.id_optional))[0]


            optional_data =  (await get_optionals(db=db, id_stage=p.id_stage, id_optional=p.id_optional))[0]

            print(f'Optional data: \n{optional_data}\n')
            print(f'activity_data: \n{activity_data}\n')

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
                'place_of_purchase':'MEX',
                'source':'Rooming List',
                'payment_method':'Cash'                    
            })
            print(f'el opcional a guardar es: \n{vars(optional_purchase)}\n\n')

            db.add(optional_purchase)
        db.commit()



            

            
