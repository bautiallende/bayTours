from .optional_purchase_handler import OptionalPurchaseHandler

optional_purchase = OptionalPurchaseHandler()


optionals_purchases_handlers = {
    'create_optional_purchase':optional_purchase.create,
}