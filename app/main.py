from fastapi import FastAPI
from .routers import group, clients, upload, hotel
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

origins = [
    "http://localhost:8001",
    "http://127.0.0.1:8001",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(group.router)
app.include_router(clients.router)
app.include_router(upload.router)
app.include_router(hotel.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to BAYTOURS API"}


@app.get("/test")
def test_endpoint():
    return {"message": "Test endpoint is working!"}



# # Esto es solo un ejemplo de cómo podrías definir un modelo en SQLAlchemy
# from sqlalchemy import Column, Integer, String

# class User(Base):
#     __tablename__ = "users"

#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String, index=True)

# # Crear las tablas en la base de datos
# Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)