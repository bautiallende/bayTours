from .activities_handlers import ActivityHandler


activity = ActivityHandler()

activity_handlers = {
    'create': activity.create,
    

}