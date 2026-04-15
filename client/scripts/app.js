// URL de tu servidor Express
const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    loadPosts();
    loadNotifications();
    loadChats();

    document.getElementById('btnSubmitPost').addEventListener('click', createPost);
});

// --- CARGAR POSTS DESDE EL BACKEND ---
async function loadPosts() {
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = '<p>Cargando publicaciones del Campus...</p>';

    try {
        // Llamada real a tu API de Express
        const response = await fetch(`${API_URL}/posts`);
        const posts = await response.json();

        postsContainer.innerHTML = ''; 

        if (posts.length === 0) {
            postsContainer.innerHTML = '<p class="card">Aún no hay publicaciones. ¡Sé el primero!</p>';
            return;
        }

        posts.forEach(post => {
            const postHTML = `
                <div class="card post">
                    <div class="post-header">
                        <strong>${post.author?.name || 'Usuario'}</strong> 
                        <span class="text-muted"> — ${new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div class="post-body">
                        <p>${post.content}</p>
                    </div>
                    <div class="post-footer">
                        <button class="btn-action">👍 Like</button>
                        <button class="btn-action">💬 Comentar</button>
                    </div>
                </div>
            `;
            postsContainer.innerHTML += postHTML;
        });

    } catch (error) {
        console.error("Error cargando los posts:", error);
        postsContainer.innerHTML = '<p class="card" style="color:red;">Error al conectar con el servidor.</p>';
    }
}

// --- CREAR POST REAL EN LA BASE DE DATOS ---
async function createPost() {
    const contentInput = document.getElementById('postContent');
    const content = contentInput.value;
    
    // El checkbox de anónimo lo usaremos más adelante cuando configures roles
    const isAnonymous = document.getElementById('chkAnonymous')?.checked;

    if (!content.trim()) return alert("El post no puede estar vacío");

    try {
        const response = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                title: "Post de Campus", // Título genérico requerido por tu esquema actual
                content: content, 
                authorId: 1 // IMPORTANTE: Asegúrate de que exista un usuario con ID 1 en Supabase
            })
        });

        if (response.ok) {
            contentInput.value = ''; // Limpiar textarea
            loadPosts(); // Recargar el muro inmediatamente
        } else {
            const errorData = await response.json();
            alert("Error al publicar: " + errorData.error);
        }

    } catch (error) {
        console.error("Error al publicar:", error);
        alert("El servidor no responde.");
    }
}

// --- FUNCIONES PENDIENTES (Para cuando crees las tablas en Prisma) ---
async function loadUserProfile() {
    // Aquí podrías poner datos estáticos por ahora
    document.getElementById('userName').innerText = "Enzo";
    document.getElementById('userRole').innerText = "Estudiante DAW";
}

async function loadNotifications() { /* Pendiente */ }
async function loadChats() { /* Pendiente */ }