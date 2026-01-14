from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_GET, require_POST
from django.contrib.auth.decorators import login_required
from .models import ChatMessage
from .forms import ChatMessageForm
from events.models import Event

# ----------------------------
# 1. Carregar missatges
# ----------------------------
@require_GET
def chat_load_messages(request, event_pk):
    event = get_object_or_404(Event, pk=event_pk)

    all_msgs = list(ChatMessage.objects.filter(event_id=event.id))
    msgs = [m for m in all_msgs if m.is_deleted == 0]
    msgs.sort(key=lambda m: m.created_at)
    msgs = msgs[-50:]

    data = []
    for msg in msgs:
        data.append({
            'id': msg.id,
            'user': msg.user_id,
            'display_name': msg.user_display_name,
            'message': msg.message,
            'created_at': msg.get_time_since(),
            'can_delete': request.user.is_authenticated and request.user.id == msg.user_id,
            'is_highlighted': msg.is_highlighted
        })

    return JsonResponse({
        'success': True,
        'messages': data
    })



# ----------------------------
# 2. Enviar missatge
# ----------------------------
@login_required
@require_POST
def chat_send_message(request, event_pk):
    event = get_object_or_404(Event, pk=event_pk)
    if event.status != 'live':
        return JsonResponse({'success': False, 'error': 'El xat només està actiu durant l\'esdeveniment'})

    form = ChatMessageForm(request.POST)
    if form.is_valid():
        msg = form.save(commit=False)
        msg.event_id = event.id
        msg.user_id = request.user.id
        msg.username = request.user.username
        msg.user_display_name = getattr(request.user, 'display_name', request.user.username)
        msg.save()

        return JsonResponse({
            'success': True,
            'message': {
                'id': msg.id,
                'user': msg.username,
                'display_name': msg.user_display_name,
                'message': msg.message,
                'created_at': msg.get_time_since(),
                'can_delete': True,
                'is_highlighted': False
            }
        })
    else:
        errors = {field: [str(e) for e in errs] for field, errs in form.errors.items()}
        return JsonResponse({'success': False, 'errors': errors})


# ----------------------------
# 3. Eliminar missatge
# ----------------------------
@login_required
@require_POST
def chat_delete_message(request, message_pk):
    try:
        msg = ChatMessage.objects.get(pk=message_pk)
        if msg.can_delete(request.user):
            msg.is_deleted = 1
            msg.save()
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'error': 'No tens permís'})
    except ChatMessage.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Missatge no trobat'})


# ----------------------------
# 4. Destacar missatge (opcional)
# ----------------------------
@login_required
@require_POST
def chat_highlight_message(request, message_pk):
    try:
        msg = ChatMessage.objects.get(pk=message_pk)
        event = get_object_or_404(Event, pk=msg.event_id)
        if request.user != event.creator and not request.user.is_staff:
            return JsonResponse({'success': False, 'error': 'Només el creador pot destacar missatges'})
        msg.is_highlighted = not msg.is_highlighted
        msg.save()
        return JsonResponse({'success': True, 'is_highlighted': bool(msg.is_highlighted)})
    except ChatMessage.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Missatge no trobat'})
