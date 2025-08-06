from .local_guides_handler import LocalGuideHandler

reservation = LocalGuideHandler()

guides_handler = {
    "create": reservation,
    "update": reservation,
}