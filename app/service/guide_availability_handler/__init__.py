from .guides_availabiliy_handler import GuidesAvailabilityHandler


handler = GuidesAvailabilityHandler()


availability_handler = {
    'create_slot':handler.create_slot,
    'update_slot':handler.update_slot,
    'delete_slot':handler.delete_slot,

}