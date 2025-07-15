
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import timedelta, datetime

from app.schemas.calendar import CalendarEvent
from app.service import hotel_reservation as hotel_reservation_service
from app.service import activity as activity_service
from app.service import day_transports as day_transports_service
from app.service import group_city_permits as permits_service


async def get_group_calendar_events(
    db: AsyncSession,
    id_group: str,
    start: Optional[str] = None,
    end:   Optional[str] = None,
    filters: Optional[str] = None,
) -> List[CalendarEvent]:
    """
    Devuelve eventos de calendario para un grupo, incluyendo hoteles, actividades y permisos.
    Se pueden aplicar filtros y rango de fechas.
    """
    
    events: List[CalendarEvent] = []
    # 1. Hoteles
    hotel_filters = {}
    if filters:
        import json
        hotel_filters = json.loads(filters)
    if start:
        hotel_filters['check_in'] = start
    if end:
        hotel_filters['check_out'] = end

    events: List[CalendarEvent] = []

    # 1. Hoteles
    rows = await hotel_reservation_service.get_hotel_reservation(
        db=db, id_group=id_group, filters=hotel_filters
    )
    seen_hotels = set()

    for r in rows:
        # Clave única: mismo hotel, fechas y pax
        key = (
            r.get('id_hotel'), r.get('check_in'), r.get('hour_check_in'),
            r.get('check_out'), r.get('hour_check_out'), r.get('pax')
        )
        if key in seen_hotels:
            continue
        seen_hotels.add(key)

        # Requerimos al menos id_hotel y fechas
        if not r.get('id_hotel') or not r.get('check_in') or not r.get('check_out'):
            continue

        ci = r['check_in']      # 'DD/MM'
        co = r['check_out']     # 'DD/MM'
        d  = r['date']          # 'DD/MM/YYYY'

        try:
            dd, mm, yy = d.split('/')
            year = int(yy)
            day_ci, month_ci = map(int, ci.split('/'))
            day_co, month_co = map(int, co.split('/'))

            # Hora de check-in
            if r.get('hour_check_in'):
                h_ci, m_ci = map(int, r['hour_check_in'].split(':'))
            else:
                h_ci, m_ci = 15, 0
            start_dt = datetime(year, month_ci, day_ci, h_ci, m_ci)

            # Hora de check-out
            if r.get('hour_check_out'):
                h_co, m_co = map(int, r['hour_check_out'].split(':'))
            else:
                h_co, m_co = 11, 0
            end_dt = datetime(year, month_co, day_co, h_co, m_co)

        except Exception:
            continue

        events.append(CalendarEvent(
            id=f"hotel-{r['assignment_id']}",
            type="hotel",
            title=r['hotel_name'],
            start=start_dt.isoformat(),
            end=end_dt.isoformat(),
            color="#DBFFCB",
            extendedProps={
                "Ciudad": r['city'],
                "Pax": r['pax'],
                "Check-in": r['hour_check_in'],
                "Check-out": r['hour_check_out'],
                "Comentarios": r['notes'],
                "Direccion": r['address'],
                "Telefono 1": r['phone_1'],
                "Telefono 2": r['phone_2'],
                "Mail 1": r['mail_1'],
                "Mail 2": r['mail_2'],
            }
        ))

    # 2. Actividades opcionales
    opt_rows = await activity_service.get_calendar_data(db, id_group, start, end, filters)
    for o in opt_rows:
        print(o)
        if not o.get('id') or not o.get('title'):
            continue
        events.append(CalendarEvent(
        id=o.get('id'),
        type="optional",
        title=o.get('title'),
        start=o.get('start').isoformat(),
        end=o.get('end').isoformat(),
        color="#FFF1D5",
        extendedProps={
            "Ciudad": o.get('city'),
            "Horario":o.get('time', ''),
            "Duracion": o.get('duration'),  
            "Guia local": o.get('guide', ''),
            "Pax": o.get('pax'),
            "Comentarios": o.get('comments'),
            "Numero de reserva": o.get('reservation_n')
        }
        ))
   
    # 3. Permisos
    # perm_rows = await permits_service.get_calendar_data(db=db, id_group=id_group, start=start, end=end, filters=filters)
    # for p in perm_rows:
    #     color = "#5cb85c" if p.processed else "#d9534f"
    #     events.append(CalendarEvent(
    #         id=f"permit-{p.id}",
    #         type="permit",
    #         title="Permiso" + p.city,
    #         start=p.date.isoformat(),
    #         color=color,
    #         extendedProps={
    #             "city": p.city,
    #             "processed": p.processed
    #         }
    #     ))

    # 4. Metodos de transporte 

    transport_rows = await day_transports_service.get_transports_by_id_group(db, id_group)
    for t in transport_rows:
        events.append(CalendarEvent(
        id=str(t.id_transport),
        type="transport",
        title=str(t.mode.capitalize()) + " - " + str(t.operator_name) + " - " + str(t.reference_code),
        start=t.departure_time.isoformat() if t.departure_time else '',
        end=(t.departure_time + timedelta(hours=1)).isoformat() if t.departure_time else '',
        color="#A0FA7C",
        extendedProps={
            "Metodo de transporte": t.mode.capitalize(),
            "Proveedores": t.operator_name,
            "Codigo de referencia": t.reference_code,
            "Comentarios": t.notes,
            "Horario de partida": t.departure_time.isoformat() if t.departure_time else '',
        }
        ))
    
    # 5. Permisos de ciudad
    city_permit_rows = await permits_service.list_permits_by_group(db, id_group)
    for p in city_permit_rows:
        print(f'\n\n\n {p} \n\n\n')
        color = "#e0c5e0" if p.status == "approved" else "#da89d7" #"#f09693"
        events.append(CalendarEvent(
            id=f"{p.id_permit}",
            type="permit",
            title=f"Permiso {p.city.name} ({p.permit_number if p.permit_number else 'SIN PERMISO'})",
            start=p.valid_from.isoformat(),
            end=p.valid_to.isoformat(),
            color=color,
            extendedProps={
                "Ciudad": p.city.name,
                "Estado": p.status,
                "Numero de permiso": p.permit_number,
                "Realizado por": p.managed_by,
                "Proveedor": p.provider,
                "Precio": p.price,
                "Pagado con": p.payed_with,
                "Fecha de pago": p.payment_date.isoformat() if p.payment_date else None,
                "Comentarios": p.comments
            }
        ))
    return events
