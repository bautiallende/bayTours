from .hotels_handlers import HotelsHandler

hotels = HotelsHandler()


hotels_actions = {
    'new_hotel': hotels.create,
    'get_hotel_by_id': '',#hotels.get_by_id,
    'update_hotel': '',#hotels.update,
    'delete_hotel': '',#hotels.delete
    }