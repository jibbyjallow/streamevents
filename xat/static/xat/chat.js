// chat.js - VERSIÓN CORREGIDA

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


document.addEventListener('DOMContentLoaded', function() {
    console.log('=== XAT INICIALITZAT ===');
    
    // Elementos
    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) {
        console.error('No chat container found');
        return;
    }
    
    const eventId = chatContainer.dataset.eventId;
    console.log('Event ID:', eventId);
    
    if (!eventId) {
        console.error('No event ID');
        return;
    }
    
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const messageCount = document.getElementById('message-count');
    
    // ======================
    // 1. CARGAR MENSAJES
    // ======================
    function loadMessages() {
        console.log(`Loading messages for event ${eventId}...`);
        
        fetch(`/chat/${eventId}/messages/`)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            })
            .then(data => {
                console.log('Datos recibidos:', data);
                
                if (!chatMessages) return;
                
                if (data.success && data.messages && data.messages.length > 0) {
                    let html = '';
                    
                    data.messages.forEach(msg => {
                        html += `
                        <div class="chat-message mb-3 p-3 border rounded bg-white" data-message-id="${msg.id}">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <strong class="text-primary">${msg.display_name}</strong>
                                <small class="text-muted">${msg.created_at}</small>
                            </div>
                            <div class="message-content">${escapeHtml(msg.message)}</div>
                            ${msg.can_delete ? `
                                <div class="text-end mt-2">
                                    <button class="btn btn-sm btn-outline-danger delete-message">
                                        <i class="bi bi-trash"></i> Eliminar
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                        `;
                    });
                    
                    chatMessages.innerHTML = html;
                    
                    // Actualizar contador
                    if (messageCount) {
                        messageCount.textContent = data.messages.length;
                        console.log(`Contador: ${data.messages.length} mensajes`);
                    }
                    
                    // Scroll al final
                    setTimeout(() => {
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }, 100);
                    
                } else {
                    // No hay mensajes
                    chatMessages.innerHTML = `
                        <div class="text-center py-5 text-muted">
                            <i class="bi bi-chat" style="font-size: 2rem;"></i>
                            <p class="mt-2">No hay mensajes todavía</p>
                            <small>¡Sé el primero en escribir!</small>
                        </div>
                    `;
                    
                    if (messageCount) messageCount.textContent = '0';
                }
            })
            .catch(error => {
                console.error('Error cargando mensajes:', error);
                if (chatMessages) {
                    chatMessages.innerHTML = `
                        <div class="alert alert-danger">
                            <i class="bi bi-exclamation-triangle"></i>
                            Error cargando mensajes
                        </div>
                    `;
                }
            });
    }
    
    // ======================
    // 2. ENVIAR MENSAJE - CORREGIDO
    // ======================
    if (chatForm) {
        console.log('Formulario encontrado, añadiendo event listener...');
        
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Formulario enviado');
            
            // Obtener textarea
            const textarea = this.querySelector('textarea[name="message"]');
            if (!textarea) {
                alert('Error: No se encuentra el campo de mensaje');
                return;
            }
            
            const message = textarea.value.trim();
            console.log('Mensaje a enviar:', message);
            
            // Validación
            if (!message) {
                alert('Por favor, escribe un mensaje');
                textarea.focus();
                return;
            }
            
            if (message.length > 500) {
                alert('Máximo 500 caracteres');
                return;
            }
            
            // Obtener CSRF token
            const csrfInput = this.querySelector('input[name="csrfmiddlewaretoken"]');
            if (!csrfInput) {
                alert('Error de seguridad. Recarga la página.');
                return;
            }
            const csrfToken = csrfInput.value;
            
            // Desactivar botón
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Enviando...';
            submitBtn.disabled = true;
            
            // CREAR FormData CORRECTAMENTE
            const formData = new FormData(this);  // ¡Esto es lo importante!
            
            // También podemos crearlo manualmente:
            // const formData = new FormData();
            // formData.append('csrfmiddlewaretoken', csrfToken);
            // formData.append('message', message);
            
            console.log('FormData creado, enviando...');
            
            // Enviar petición
            fetch(`/chat/${eventId}/send/`, {
                method: 'POST',
                body: formData  // ¡FormData, no JSON!
                // NO añadir headers Content-Type, FormData lo hace automáticamente
            })
            .then(response => {
                console.log('Respuesta recibida, status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('Datos respuesta:', data);
                
                if (data.success) {
                    // Éxito: limpiar y recargar
                    textarea.value = '';
                    textarea.focus();
                    loadMessages();
                    console.log('✅ Mensaje enviado con éxito');
                } else {
                    // Error
                    console.error('❌ Error del servidor:', data.error);
                    alert(data.error || 'Error enviando mensaje');
                }
            })
            .catch(error => {
                console.error('❌ Error de red:', error);
                alert('Error de conexión con el servidor');
            })
            .finally(() => {
                // Reactivar botón
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                console.log('Botón reactivado');
            });
        });
        
    } else {
        console.log('Formulario no disponible (usuario no autenticado o evento no activo)');
    }
    
    // ======================
    // 3. ELIMINAR MENSAJE
    // ======================
    if (chatMessages) {
        chatMessages.addEventListener('click', function(e) {
            if (e.target.closest('.delete-message')) {
                const messageDiv = e.target.closest('.chat-message');
                const messageId = messageDiv.dataset.messageId;
                
                console.log('Intentando eliminar mensaje', messageId);
                
                if (!confirm('¿Eliminar este mensaje?')) return;
                
                const csrfToken = document.querySelector('[name="csrfmiddlewaretoken"]').value;
                
                // Usar FormData también para eliminar
                const formData = new FormData();
                formData.append('csrfmiddlewaretoken', csrfToken);
                
                fetch(`/chat/message/${messageId}/delete/`, {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        console.log('Mensaje eliminado');
                        loadMessages();
                    } else {
                        alert(data.error || 'Error eliminando');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error de conexión');
                });
            }
        });
    }
    
    // ======================
    // 4. INICIAR
    // ======================
    console.log('Iniciando sistema de chat...');
    loadMessages();
    
    // Actualizar automáticamente cada 5 segundos
    setInterval(loadMessages, 5000);
    
    console.log('✅ Chat inicializado correctamente');
});