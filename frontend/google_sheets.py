import os
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from starlette.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow



# Si modificas estos alcances, elimina el archivo token.pickle
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

REDIRECT_URI = 'http://localhost:8001/oauth2callback'

CREDENTIALS = "../credentials.json"


def get_credentials(session):
    creds = None
    if 'credentials' in session:
        creds = Credentials(**session['credentials'])

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
            # Actualizar las credenciales en la sesión
            session['credentials'] = {
                'token': creds.token,
                'refresh_token': creds.refresh_token,
                'token_uri': creds.token_uri,
                'client_id': creds.client_id,
                'client_secret': creds.client_secret,
                'scopes': creds.scopes
            }
        else:
            flow = Flow.from_client_secrets_file(
                CREDENTIALS,
                scopes=SCOPES,
                redirect_uri=REDIRECT_URI
            )
            authorization_url, state = flow.authorization_url(
                access_type='offline',
                include_granted_scopes='true'
            )
            session['state'] = state
            # Redirigir al usuario al URL de autorización
            return RedirectResponse(authorization_url)
    return creds

def export_to_sheets(data, session):
    creds = get_credentials(session)
    # Si creds es una instancia de RedirectResponse, significa que debemos redirigir al usuario para autenticación
    if isinstance(creds, RedirectResponse):
        return creds  # Esto hará que la vista que llamó a export_to_sheets redirija al usuario

    service = build('sheets', 'v4', credentials=creds)
    
    # Crear una nueva hoja de cálculo
    spreadsheet = {
        'properties': {
            'title': 'Exportación de Datos'
        }
    }
    spreadsheet = service.spreadsheets().create(body=spreadsheet,
                                        fields='spreadsheetId').execute()
    spreadsheet_id = spreadsheet.get('spreadsheetId')
    print(f"Hoja de cálculo creada. ID: {spreadsheet_id}")

    # Preparar los datos para escribir
    # Asumiendo que 'data' es una lista de diccionarios
    if not data:
        return None  # Manejar el caso en que no hay datos para exportar

    headers = data[0].keys()
    values = [list(headers)]  # Agregar encabezados
    for row in data:
        values.append([str(row.get(header, '')) for header in headers])

    body = {
        'values': values
    }

    # Escribir los datos en la hoja de cálculo
    result = service.spreadsheets().values().update(
        spreadsheetId=spreadsheet_id,
        range='A1',
        valueInputOption='RAW',
        body=body
    ).execute()
    print(f"{result.get('updatedCells')} celdas actualizadas.")

    # Retornar el enlace a la hoja de cálculo
    return f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}"

