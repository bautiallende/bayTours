from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, crud
from ..dependencies import get_db
import pandas as pd
from app.service import rooming_list

router = APIRouter(
    prefix="/upload",
    tags=["upload"],
)

@router.post("/rooming_list/")
async def upload_rooming_list(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        # Verificar si el archivo es Excel o CSV
        if file.filename.endswith('.xlsx') or file.filename.endswith('.xls'):
            # Leer archivo Excel
            df = pd.read_excel(file.file, header=None)
        elif file.filename.endswith('.csv'):
            # Leer archivo CSV
            df = pd.read_csv(file.file, header=None)
        else:
            raise HTTPException(status_code=400, detail="Invalid file type. Please upload an Excel or CSV file.")
        
        # Procesar el rooming list
        result = await rooming_list.create_rooming(db, df)

        # Retornar un mensaje de éxito
        return {"status": "Rooming list processed successfully", "data": result['group_number']}
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while processing the file.")