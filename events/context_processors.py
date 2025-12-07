from .models import Event

def event_categories(request):
    return {
        "EVENT_CATEGORIES": Event.CATEGORY_CHOICES
    }
