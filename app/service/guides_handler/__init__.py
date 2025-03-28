from .guides_handlers import GuidesHandler

handler = GuidesHandler()


guide_handler =  {
    'new_guide': handler.create,
    'update_guide': handler.update,
    
}