from .days_handlers import DaysHandler

class_days = DaysHandler()


day_handler = {
    'new_group': class_days.create,  
}