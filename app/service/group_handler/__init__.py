from .groups_handler import GroupsHandler

groups = GroupsHandler()

groups_handlers = {
    'new_group': groups.create_group,
    'tabla_groups': groups.get_tabla_group,
    "group_data": groups.get_group_data,

}