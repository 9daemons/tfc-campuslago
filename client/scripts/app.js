document.addEventListener('DOMContentLoaded', () => {
    // Inicializar la carga de datos al abrir la página
    loadUserProfile();
    loadPosts();
    loadNotifications();
    loadChats();

    // Event Listener para crear publicación
    document.getElementById('btnSubmitPost').addEventListener('click', createPost);
});

// Función para cargar los posts del muro
async function loadPosts() {
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = '<p>Cargando publicaciones...</p>';

    try {
        // Aquí iría tu endpoint real, por ejemplo: fetch('/api/posts')
        // Simulamos una respuesta con Promesas para que veas el funcionamiento
        const mockPosts = [
            { id: 1, author: 'bessie.cooper', role: 'DAW2', content: '¡No quedan bocadillos en la máquina!', likes: 5 },
            { id: 2, author: 'Campus Lago', role: 'Oficial', content: 'Recordatorio: Mañana es festivo.', likes: 20 }
        ];

        postsContainer.innerHTML = ''; // Limpiar loader

        mockPosts.forEach(post => {
            // Cada tarjeta de post cuenta con la opción de acceder al perfil, comentar o dar like [cite: 127]
            const postHTML = `
                <div class="card post">
                    <div class="post-header">
                        <strong><a href="/perfil/${post.author}">${post.author}</a></strong> 
                        <span class="text-muted">(${post.role})</span>
                    </div>
                    <div class="post-body">
                        <p>${post.content}</p>
                    </div>
                    <div class="post-footer">
                        <button onclick="likePost(${post.id})">👍 ${post.likes} Likes</button>
                        <button onclick="openComments(${post.id})">💬 Comentar</button>
                    </div>
                </div>
            `;
            postsContainer.innerHTML += postHTML;
        });

    } catch (error) {
        console.error("Error cargando los posts:", error);
        postsContainer.innerHTML = '<p>Error al cargar el muro.</p>';
    }
}

// Función AJAX para subir un post
async function createPost() {
    const content = document.getElementById('postContent').value;
    const isAnonymous = document.getElementById('chkAnonymous').checked;

    if (!content.trim()) return alert("El post no puede estar vacío");

    try {
        /* Ejemplo de petición real a tu API:
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: content, anonymous: isAnonymous })
        });
        if(response.ok) { ... }
        */
        
        alert("Publicación creada con éxito");
        document.getElementById('postContent').value = ''; // Limpiar caja
        loadPosts(); // Recargar el muro para ver el post nuevo

    } catch (error) {
        console.error("Error al publicar:", error);
    }
}

// Esqueletos para las otras funciones de carga
async function loadNotifications() {
    // Fetch a /api/notifications
    // Mostrar en la lista de la tarjeta fija de notificaciones [cite: 107]
}

async function loadChats() {
    // Fetch a /api/chats
    // Si la propiedad "hasNewMessage" es true, podrías añadir una clase CSS para iluminarlo en verde [cite: 109]
}

async function loadUserProfile() {
    // Fetch a /api/user/me para rellenar la foto y si es profesor mostrar el checkbox de posts anónimos [cite: 118]
}