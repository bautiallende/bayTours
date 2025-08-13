from .guide_evaluations_handler import GuideEvaluationsHandler

handler = GuideEvaluationsHandler()


evaluation_handler =  {
    'new': handler,
    'update': handler,
    'get': handler,
    'delete': handler,
    
}