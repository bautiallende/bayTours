from .optional_purchase_handler import OptionalPurchaseHandler

optional_purchase = OptionalPurchaseHandler()


optionals_purchases_handlers = {
    'create_optional_purchase':optional_purchase.create,
    'create_one':optional_purchase.create_one,
    'update_optional_purchase': optional_purchase.update, 
    'delete':optional_purchase.delete,
}