from django.db import models
from django.utils.timesince import timesince
from django.utils import timezone

class ChatMessage(models.Model):
    # Camps per Djongo (sense ForeignKey)
    event_id = models.IntegerField()
    user_id = models.IntegerField()
    
    # Camps de cache per evitar consultes
    username = models.CharField(max_length=150, default="usuari")
    user_display_name = models.CharField(max_length=150, default="Usuari")
    
    message = models.TextField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=0)
    is_highlighted = models.BooleanField(default=0)
    
    def __str__(self):
        return f"Missatge {self.id}: {self.message[:50]}"
    
    def save(self, *args, **kwargs):
        # Si és un missatge nou, omplir camps de cache
        if not self.pk:
            try:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                user = User.objects.get(id=self.user_id)
                self.username = user.username
                self.user_display_name = getattr(user, 'display_name', user.username)
            except:
                pass  # Manté els valors per defecte
        
        super().save(*args, **kwargs)
    
    def can_delete(self, user):
        """Comprova si un usuari pot eliminar aquest missatge"""
        if not user or not user.is_authenticated:
            return False
        
        # El propi usuari pot eliminar els seus missatges
        if user.id == self.user_id:
            return True
        
        # Els administradors també poden
        return user.is_staff
    
    def get_time_since(self):
        """Retorna el temps passat des de la creació"""
        try:
            return f"fa {timesince(self.created_at)}"
        except:
            return "Ara mateix"