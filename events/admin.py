from django.contrib import admin
from .models import Event

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'creator', 'category', 'status', 'scheduled_date', 'is_featured')
    list_filter = ('category', 'status', 'is_featured')
    search_fields = ('title', 'description', 'creator__username')
    ordering = ('-scheduled_date',)
    list_per_page = 20  # Mostra 20 esdeveniments per pàgina