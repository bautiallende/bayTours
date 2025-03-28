from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.transport import Transport
from app.models.transport_company import TransportCompany
from app.models.group import Group


async def create(db:AsyncSession, transport_line= Transport):
    db.add(transport_line)
    db.commit()
    db.refresh(transport_line)
    return transport_line 


async def update_bus(db: AsyncSession, id_group: str, bus_code: str, company_id: int):
    # Recuperar el transporte asociado al grupo
    result = await get_transport_by_group_id(db=db, id_group=id_group)
    
    if not result:
        raise ValueError("El grupo o transporte no fue encontrado.")
    
    id_group, transport, company = result  # Desempaquetar el resultado
    
    if not transport:
        raise ValueError("No hay transporte asignado a este grupo.")
    
    # Modificar los atributos del modelo Transport
    transport.bus = bus_code
    transport.company_id = company_id

    # Guardar los cambios
    db.commit()
    db.refresh(transport)

    response = {'transport':transport, 
                'company': company}

    return response




async def get_transport_by_group_id(db:AsyncSession, id_group:str):
    result = db.execute(select(Group.id_group,
                   Transport,
                   TransportCompany.name                  
                   ).join(Transport, Group.id_transport == Transport.id_transport, isouter=True
                   ).join(TransportCompany, Transport.company_id == TransportCompany.company_id, isouter=True
                   ).where(Group.id_group == id_group))
    
    transport_data = result.first() 
    print(transport_data)

    return transport_data