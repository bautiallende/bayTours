from .clients_room_handler import ClientRoomHandler

client_room = ClientRoomHandler()

clients_rooms_handler = {
    'new_room': client_room.create,
    'update_room': client_room.update_room,
    'update_all_rooms': '',
}