from .activities_handlers import ActivityHandler
from .manual_handler import ManualActivitiesHandler


activity = ActivityHandler()
manual_handler = ManualActivitiesHandler()

activity_handlers = {
    'auto': activity,
    'manual': manual_handler,

}