from .hotels_reservations_handlers import HotelReservationHandler

reservation = HotelReservationHandler()

reservation_handler = {
    'create_base': reservation,
    'create': reservation.create,
    'create_one_more': reservation.create_one_more,
    'update': reservation,
    'update_many': reservation.update_many, 
    'create_many':reservation.create_many,
}