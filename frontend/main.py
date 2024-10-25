from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import httpx
import uvicorn

app = FastAPI()

# Montar el directorio 'static' en la ruta '/static'
app.mount("/static", StaticFiles(directory="static"), name="static")

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
async def grupos(request: Request):
    backend_url = "http://127.0.0.1:8000/groups/tabla_groups"
    print("Obteniendo datos de grupos del backend...")

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(backend_url)
            print(f"Respuesta del backend: {response.status_code}")
            response.raise_for_status()
            grupos_data = response.json()
            print(f"Datos obtenidos: {grupos_data}")
    except httpx.RequestError as exc:
        print(f"An error occurred while requesting {exc.request.url!r}.")
        grupos_data = []
    except httpx.HTTPStatusError as exc:
        print(f"Error response {exc.response.status_code} while requesting {exc.request.url!r}.")
        grupos_data = []

    return templates.TemplateResponse("grupos.html", {"request": request, "grupos": grupos_data})



@app.get("/nueva_rooming_list", response_class=HTMLResponse)
async def nueva_rooming_list(request: Request):
    return templates.TemplateResponse("nueva_rooming_list.html", {"request": request})


@app.post("/nueva_rooming_list", response_class=HTMLResponse)
async def nueva_rooming_list_post(request: Request):
    # Aquí procesarás el formulario para cargar la rooming list
    return templates.TemplateResponse("nueva_rooming_list.html", {"request": request, "mensaje": "Rooming list cargada correctamente"})




if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)