from .transports_handlers import TransportHandler

handler = TransportHandler()


transport_handlers = {
    'update_bus': handler.update_bus,
    }