from .rooming_list_handler import RoomingListHandler

rooming_list = RoomingListHandler()

rooming_list_handlers = {
    'create_rooming': rooming_list.create,

}