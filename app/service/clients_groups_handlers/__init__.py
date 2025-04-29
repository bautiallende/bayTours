from .client_group_handler import ClientGroupHandler

client_group = ClientGroupHandler()

client_group_handler = {
    'new_client_group': client_group.create_client_group,
    'update_client_group': client_group.update_client_group,
}