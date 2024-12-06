import os 

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import httpx
import uvicorn
from typing import Optional
from google_sheets import export_to_sheets, SCOPES, REDIRECT_URI, CREDENTIALS
from starlette.middleware.sessions import SessionMiddleware
from google_auth_oauthlib.flow import Flow
from fastapi.responses import JSONResponse
from fastapi import Body
from fastapi import Query
import requests
import copy


from datetime import datetime




app = FastAPI()

# Montar el directorio 'static' en la ruta '/static'
app.mount("/static", StaticFiles(directory="static"), name="static")
app.add_middleware(SessionMiddleware, secret_key='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')

templates = Jinja2Templates(directory="templates")



@app.get("/", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.post("/login", response_class=HTMLResponse)
async def login(request: Request, username: str = Form(...), password: str = Form(...)):
    # Validación simple para el prototipo
    if username == "admin" and password == "123":
        response = RedirectResponse(url="/home", status_code=302)
        return response
    else:
        return templates.TemplateResponse("login.html", {"request": request, "error": "Usuario o contraseña incorrectos"})

@app.get("/home", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("home.html", {"request": request})


@app.get("/grupos", response_class=HTMLResponse)
async def grupos(
    request: Request,
    id_grupo: str = None,
    bus_company: str = None,
    guide_name: str = None,
    operaciones_name: str = None,
    status: str = None,
    assistant_name: str = None,
    has_qr: bool = None,
    current_city: str = None,
    current_hotel: str = None,
    sort_by: str = None,
    order: str = None,
):
    
    # Construir los parámetros para enviar al backend
    params = {
        "id_grupo": id_grupo,
        "bus_company": bus_company,
        "guide_name": guide_name,
        "operaciones_name": operaciones_name,
        "status": status,
        "assistant_name": assistant_name,
        "has_qr": has_qr,
        "current_city": current_city,
        "current_hotel": current_hotel,
        "sort_by": sort_by,
        "order": order,
    }
    # Eliminar parámetros con valor None
    params = {k: v for k, v in params.items() if v is not None}


    backend_url = "http://127.0.0.1:8000/groups/tabla_groups"
    options_url = "http://127.0.0.1:8000/groups/groups_filter_options"

    try:
        async with httpx.AsyncClient() as client:
            # Obtener los datos de grupos
            response = await client.get(backend_url, params=params)
            response.raise_for_status()
            grupos_data = response.json()
            print(f'la tabla de grupos son: {grupos_data}')

            # Obtener las opciones para los desplegables
            options_response = await client.get(options_url)
            options_response.raise_for_status()
            options_data = options_response.json()
    except httpx.RequestError as exc:
        print(f"Ocurrió un error al solicitar {exc.request.url!r}.")
        grupos_data = []
        options_data = {}
    except httpx.HTTPStatusError as exc:
        print(f"Error de respuesta {exc.response.status_code} al solicitar {exc.request.url!r}.")
        grupos_data = []
        options_data = {}

    # Pasar los filtros y las opciones a la plantilla
    filters = {
        "id_grupo": id_grupo,
        "bus_company": bus_company,
        "guide_name": guide_name,
        "operaciones_name": operaciones_name,
        "status": status,
        "assistant_name": assistant_name,
        "has_qr": has_qr,
        "current_city": current_city,
        "current_hotel": current_hotel,
    }

    return templates.TemplateResponse("grupos.html", {
        "request": request,
        "grupos": grupos_data,
        "filters": filters,
        "options": options_data,
    })




@app.post("/nueva_rooming_list", response_class=HTMLResponse)
async def nueva_rooming_list_post(request: Request):
    # Aquí procesarás el formulario para cargar la rooming list
    print('si ingreso al endpoint de nueva rooming list')
    return templates.TemplateResponse("nueva_rooming_list.html", {"request": request, "mensaje": "Rooming list cargada correctamente"})




@app.post("/exportar_datos")
async def exportar_datos(request: Request):
    session = request.session

    # Obtener los datos del JSON
    params = await request.json()

    # Guardar los parámetros en la sesión (por si es necesario)
    session['export_params'] = params

    # Obtener los datos filtrados desde el backend
    backend_url = "http://127.0.0.1:8000/groups/tabla_groups"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(backend_url, params=params)
            response.raise_for_status()
            grupos_data = response.json()
    except Exception as e:
        print(f"Error al obtener los datos: {e}")
        grupos_data = []
        return JSONResponse(content={"error": "Error al obtener los datos"}, status_code=500)

    # Exportar los datos a Google Sheets
    result = export_to_sheets(grupos_data, session)

    # Si result es una instancia de RedirectResponse, redirige al usuario para autenticación
    if isinstance(result, RedirectResponse):
        # Devolver la URL de autenticación en la respuesta JSON
        return JSONResponse(content={"auth_url": result.headers['Location']}, status_code=401)
    
    # Si no hay datos para exportar
    if result is None:
        return JSONResponse(content={"error": "No hay datos para exportar"}, status_code=400)

    # De lo contrario, result es la URL de la hoja de cálculo
    sheet_url = result

    # Devolver la URL de la hoja de cálculo en la respuesta JSON
    return JSONResponse(content={"sheet_url": sheet_url})



@app.get("/oauth2callback")
async def oauth2callback(request: Request):
    # Obtener el estado y el código de autorización de la URL
    state = request.session.get('state')
    flow = Flow.from_client_secrets_file(
        CREDENTIALS,
        scopes=SCOPES,
        state=state,
        redirect_uri=REDIRECT_URI)
    flow.fetch_token(authorization_response=str(request.url))
    creds = flow.credentials
    # Guardar las credenciales en la sesión
    request.session['credentials'] = {
        'token': creds.token,
        'refresh_token': creds.refresh_token,
        'token_uri': creds.token_uri,
        'client_id': creds.client_id,
        'client_secret': creds.client_secret,
        'scopes': creds.scopes
    }
    # Después de la autenticación, redirigir al usuario a la página de exportación nuevamente
    return RedirectResponse('/exportar_datos')  # La solicitud será GET



@app.get("/grupo/{id_group}", response_class=HTMLResponse)
async def grupo_detalle(request: Request, id_group: str, table: str = "clientes"):
    print(f'\n\n BUSCANDO GRUPO... \n\n')
    backend_url = "http://127.0.0.1:8000/groups/group_data"

    params = {
        "id_group": id_group,
        "table": table
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(backend_url, params=params)
            response.raise_for_status()
            data = response.json()
    except Exception as e:
        print(f"Error al obtener los datos del grupo: {e}")
        # Asignar un valor predeterminado a data
        data = {}
        # Puedes redirigir al usuario a una página de error o mostrar un mensaje
        return templates.TemplateResponse("error.html", {"request": request, "message": "Grupo no encontrado."})
    
    
    group_data = data.get('group_data', {})
    table_data = data.get('table_data', [])
    itinerary = data.get('itinerary', [])

    print(f'group data obtenido del endpoint: \n{group_data}\n')
    print(f'table data obtenido del endpoint: \n{table_data}\n')
    print(f'itinerary obtenido del endpoint: \n{itinerary}\n')


    # Obtener la fecha actual
    current_date = datetime.utcnow().date()

    if itinerary:
        # Convertir las fechas en el itinerario a objetos de fecha
        for city_info in itinerary:
            serializable_days = []
            for day in city_info.get('days', []):
                # Convertir la cadena de fecha a objeto date
                if 'date' in day and day['date']:
                    day['date_obj'] = datetime.strptime(day['date'], '%d-%m-%Y').date()
                else:
                    day['date_obj'] = None
                # Crear una copia del día sin 'date_obj' para serializar
                day_serializable = copy.deepcopy(day)
                if 'date_obj' in day_serializable:
                    del day_serializable['date_obj']
                serializable_days.append(day_serializable)
            # Agregar la lista de días serializables al city_info
            city_info['days_serializable'] = serializable_days

    client_ages = {
        client['id_clients']: client['age']
        for client in table_data
        if 'id_clients' in client and 'age' in client and client['id_clients'] is not None and client['age'] is not None
        }
    print(client_ages)
    return templates.TemplateResponse("grupo_detalle.html", {
        "request": request,
        "group_data": group_data,
        "table_data": table_data,
        "itinerary": itinerary,
        "client_ages": client_ages,
        "id_group": id_group,
        "current_table": table,
        "current_date": current_date,
        "datetime": datetime
    })
    
    
    
@app.get("/grupo/{id_group}/available_guides")
async def get_available_guides(id_group: str, starting_date: str = Query(None), ending_date: str = Query(None)):
    print(f"Fechas de inicio y fin recibidas: {starting_date}, {ending_date}")

    backend_url = "http://127.0.0.1:8000/guides/get_group_dispo"

    if starting_date:
        try:
            starting_date_obj = datetime.strptime(starting_date, '%d/%m/%Y %H:%M')
            starting_date_str = starting_date_obj.strftime('%Y-%m-%d')  # Modificar el formato
        except ValueError:
            starting_date_str = starting_date  # Usar el valor tal cual si no coincide el formato

    if ending_date:
        try:
            ending_date_obj = datetime.strptime(ending_date, '%d/%m/%Y %H:%M')
            ending_date_str = ending_date_obj.strftime('%Y-%m-%d')  # Modificar el formato
        except ValueError:
            ending_date_str = ending_date

    print("Fechas de inicio y llegada "+ starting_date_str, ending_date_str)

    params = {
        "starting_date": starting_date_str,
        "ending_date": ending_date_str,
        "id_group": id_group
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(backend_url, params=params)
            response.raise_for_status()
            data = response.json()
            return JSONResponse(content=data)
    except Exception as e:
        print(f"Error al obtener los guías disponibles: {e}")
        return JSONResponse(content={"error": "Error al obtener los guías disponibles"}, status_code=500)
    


@app.post("/grupo/{id_group}/update_guide")
async def update_guide(id_group: str, request: Request, data: dict = Body(...)):
    backend_url = "http://127.0.0.1:8000/groups/update_guide"

    # Obtener el id_guide desde el cuerpo de la petición
    id_guide = data.get('guide_id')

    params = {
        "id_group": id_group,
        "id_guide": id_guide
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.put(backend_url, params=params)
            print(f"response antes: {response}")
            response.raise_for_status()
            data = response.json()
            print(f"response despues: {data}")
            return JSONResponse(content=data)
    except Exception as e:
        print(f"Error al actualizar el guía: {e}")
        return JSONResponse(content={"status": "error", "message": "Error al actualizar el guía"}, status_code=500)



@app.get("/grupo/{id_group}/available_bus_companies")
async def get_available_bus_companies(id_group: str):
    print(f"Endpoint '/grupo/{id_group}/available_bus_companies' llamado")
    backend_url = "http://127.0.0.1:8000/transports/companys"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(backend_url)
            response.raise_for_status()
            data = response.json()
            print(f"Información de las compañías de bus: {data}")
            return JSONResponse(content=data)
    except Exception as e:
        print(f"Error al obtener las compañías de buses: {e}")
        return JSONResponse(content={"error": "Error al obtener las compañías de buses"}, status_code=500)



@app.post("/grupo/{id_group}/update_bus")
async def update_bus(id_group: str, request: Request, data: dict = Body(...)):
    backend_url = "http://127.0.0.1:8000/transports/update_bus"

    print(f'id_group: {id_group}')

    company_id = data.get('company_id')
    bus_code = data.get('bus_code')

    params = {
        "id_group": id_group,
        "company_id": company_id,
        "bus_code": bus_code
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.put(backend_url, params=params)
            response.raise_for_status()
            data = response.json()
            return JSONResponse(content=data)
    except Exception as e:
        print(f"Error al actualizar el bus: {e}")
        return JSONResponse(content={"status": "error", "message": "Error al actualizar el bus"}, status_code=500)
    


@app.get("/grupo/{id_group}/available_operations_agents")
async def get_available_operations_agents(id_group: str):
    backend_url = "http://127.0.0.1:8000/operations/get_operations_dispo"

    params = {
        "id_group": id_group
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(backend_url, params=params)
            response.raise_for_status()
            data = response.json()
            return JSONResponse(content=data)
    except Exception as e:
        print(f"Error al obtener los agentes de operaciones: {e}")
        return JSONResponse(content={"error": "Error al obtener los agentes de operaciones"}, status_code=500)



@app.post("/grupo/{id_group}/update_operations_agent")
async def update_operations_agent(id_group: str, request: Request, data: dict = Body(...)):
    backend_url = "http://127.0.0.1:8000/groups/update_operations"

    id_operations = data.get('id_operations')

    params = {
        "id_group": id_group,
        "id_operations": id_operations
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.put(backend_url, params=params)
            response.raise_for_status()
            data = response.json()
            print(f'la data es la siguiente: {data}')
            return JSONResponse(content=data)
    except Exception as e:
        print(f"Error al actualizar el agente de operaciones: {e}")
        return JSONResponse(content={"status": "error", "message": "Error al actualizar el agente de operaciones"}, status_code=500)



@app.get("/grupo/{id_group}/available_assistants")
async def get_available_assistants(id_group: str):
    backend_url = "http://127.0.0.1:8000/assistants/get_assistants"

    params = {
        "id_group": id_group
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(backend_url, params=params)
            response.raise_for_status()
            data = response.json()
            return JSONResponse(content=data)
    except Exception as e:
        print(f"Error al obtener los asistentes: {e}")
        return JSONResponse(content={"error": "Error al obtener los asistentes"}, status_code=500)
    


@app.post("/grupo/{id_group}/update_assistant")
async def update_assistant(id_group: str, request: Request, data: dict = Body(...)):
    backend_url = "http://127.0.0.1:8000/groups/update_assistante"

    id_assistant = data.get('id_assistant')

    params = {
        "id_group": id_group,
        "id_assistant": id_assistant
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.put(backend_url, params=params)
            response.raise_for_status()
            data = response.json()
            return JSONResponse(content=data)
    except Exception as e:
        print(f"Error al actualizar el asistente: {e}")
        return JSONResponse(content={"status": "error", "message": "Error al actualizar el asistente"}, status_code=500)



@app.get("/grupo/{id_group}/available_responsible_hotels")
async def get_available_responsible_hotels(id_group: str):
    backend_url = "http://127.0.0.1:8000/responsable_hotels/get_responsable_hotels"

    params = {
        "id_group": id_group
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(backend_url, params=params)
            response.raise_for_status()
            data = response.json()
            return JSONResponse(content=data)
    except Exception as e:
        print(f"Error al obtener los responsables de hoteles: {e}")
        return JSONResponse(content={"error": "Error al obtener los responsables de hoteles"}, status_code=500)



@app.post("/grupo/{id_group}/update_responsible_hotels")
async def update_responsible_hotels(id_group: str, request: Request, data: dict = Body(...)):
    backend_url = "http://127.0.0.1:8000/groups/update_responsable_hotels"

    id_responsible_hotels = data.get('id_responsible_hotels')

    params = {
        "id_group": id_group,
        "id_responsible_hotels": id_responsible_hotels
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.put(backend_url, params=params)
            response.raise_for_status()
            data = response.json()
            return JSONResponse(content=data)
    except Exception as e:
        print(f"Error al actualizar el responsable de hoteles: {e}")
        return JSONResponse(content={"status": "error", "message": "Error al actualizar el responsable de hoteles"}, status_code=500)



@app.post("/grupo/{id_group}/update_qr")
async def update_qr(id_group: str, request: Request, data: dict = Body(...)):
    backend_url = "http://127.0.0.1:8000/groups/update_qr"

    has_qr = data.get('has_qr')

    params = {
        "id_group": id_group,
        "has_qr": has_qr
    }
    print(f'los params a enviar son: {params}')
    try:
        async with httpx.AsyncClient() as client:
            response = await client.put(backend_url, params=params)
            response.raise_for_status()
            data = response.json()
            print(f'la data para el responde de update_qr es: {data}')
            return JSONResponse(content=data)
    except Exception as e:
        print(f"Error al actualizar el estado del QR: {e}")
        return JSONResponse(content={"status": "error", "message": "Error al actualizar el estado del QR"}, status_code=500)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)