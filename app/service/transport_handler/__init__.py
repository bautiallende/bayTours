from .transports_handlers import TransportHandler

handler = TransportHandler()


transport_handlers = {
    'AutoHandler': handler, 
    'update_bus': handler.update_bus,
    }