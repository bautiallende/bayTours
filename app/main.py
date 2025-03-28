from fastapi import FastAPI
from .routers import group, clients, upload, hotel, guide, transport, operations, assistant, responsable_hotels, optionals_purchase, days, activity, hotel_reservation, rooms, hotels_rooms
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

origins = [
    "http://localhost:8001",
    "http://127.0.0.1:8001",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(group.router)
app.include_router(clients.router)
app.include_router(upload.router)
app.include_router(hotel.router)
app.include_router(guide.router)
app.include_router(transport.router)
app.include_router(operations.router)
app.include_router(assistant.router)
app.include_router(responsable_hotels.router)
app.include_router(optionals_purchase.router)
app.include_router(days.router)
app.include_router(activity.router)
app.include_router(hotel_reservation.router)
app.include_router(rooms.router)
app.include_router(hotels_rooms.router)


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