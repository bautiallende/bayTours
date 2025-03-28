from .clients_handler import ClientsHandler

clients = ClientsHandler()


clients_handlers = {
    "New_group":clients.create,
}