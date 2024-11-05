from .hotels_reservations_handlers import HotelReservationHandler

reservation = HotelReservationHandler()

reservation_handler = {
    'create': reservation.create, 
}