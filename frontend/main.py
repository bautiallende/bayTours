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
    backend_url = "http://127.0.0.1:8000/groups/group_data"

    params = {
        "id_group": id_group,
        "table": table
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(backend_url, params=params)
            response.raise_for_status()
            group_data = response.json()
    except Exception as e:
        print(f"Error al obtener los datos del grupo: {e}")
        group_data = []
    print(f'group data obtenido del endpoint: {group_data}')
    # Pasar los datos al template
    return templates.TemplateResponse("grupo_detalle.html", {
        "request": request,
        "group_data": group_data[0] if group_data else {},
        "id_group": id_group,
        "table": table
    })




if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)