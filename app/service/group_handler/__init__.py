from .groups_handler import GroupsHandler
from .group_auto_handler import GroupsAutoHandler

groups = GroupsHandler()

groups_handlers = {
    'new_group': groups.create_group,
    'tabla_groups': groups.get_tabla_group,
    "group_data": groups.get_group_data,
    'update_guide': groups.set_guide,
    'set_operations': groups.set_operations,
    'set_assistant': groups.set_assistant,
    'set_responsable_hotel': groups.set_responsable_hotels,
    'set_qr':groups.set_qr,


    "rooming_list": GroupsAutoHandler(),
}