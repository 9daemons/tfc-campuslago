// API_URL viene de config.js

document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    loadPosts();

    document.getElementById('btnSubmitPost').addEventListener('click', createPost);
    document.getElementById('btnLogout').addEventListener('click', logout);
});

// --- TIEMPO RELATIVO ---
function timeAgo(dateString) {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60)  return 'Ahora mismo';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)  return `Hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24)    return `Hace ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7)      return `Hace ${days}d`;
    return new Date(dateString).toLocaleDateString('es-ES');
}

// --- PERFIL EN NAVBAR Y SIDEBAR ---
function loadUserProfile() {
    const user = getUser();
    if (!user) return;

    const roleLabels = { ALUMNO: 'Alumno/a', PROFESOR: 'Profesor/a', ADMINISTRADOR: 'Administrador' };

    // Sidebar derecho
    document.getElementById('userName').innerText = user.name;
    document.getElementById('userRole').innerText = roleLabels[user.role] || user.role;

    // Enlace del sidebar al propio perfil
    document.getElementById('myProfileLink').href = `profile.html?id=${user.id}`;
}

// --- CARGAR POSTS ---
async function loadPosts() {
    const container = document.getElementById('postsContainer');
    container.innerHTML = '<p class="text-muted" style="text-align:center;padding:20px;">Cargando publicaciones...</p>';

    try {
        const res = await fetch(`${API_URL}/posts`);
        const posts = await res.json();

        container.innerHTML = '';

        if (posts.length === 0) {
            container.innerHTML = '<p class="card">Aún no hay publicaciones. ¡Sé el primero!</p>';
            return;
        }

        posts.forEach(post => renderPost(post, container));

    } catch (error) {
        console.error('Error cargando posts:', error);
        container.innerHTML = '<p class="card" style="color:red;">Error al conectar con el servidor.</p>';
    }
}

function renderPost(post, container) {
    const isOfficial = post.isAnonymous;
    const isProfesor = !isOfficial && post.author?.role === 'PROFESOR';

    let extraClass = '';
    let authorHTML = '';
    const avatarSrc = post.author?.avatarUrl || '../assets/defaultprofile.png';

    if (isOfficial) {
        extraClass = 'post--official';
        authorHTML = `<span class="post-official-label">📢 Aviso Oficial</span>`;
    } else if (isProfesor) {
        extraClass = 'post--profesor';
        authorHTML = `
            <img src="${avatarSrc}" class="avatar-small" alt="">
            <a href="profile.html?id=${post.author.id}" class="author-link">${post.author.name}</a>
            <span class="role-badge role-profesor">Profesor/a</span>
        `;
    } else {
        authorHTML = `
            <img src="${avatarSrc}" class="avatar-small" alt="">
            <a href="profile.html?id=${post.author?.id}" class="author-link">${post.author?.name || 'Usuario'}</a>
        `;
    }

    const likeCount = post._count?.likes ?? 0;
    const commentCount = post._count?.comments ?? 0;

    const card = document.createElement('div');
    card.className = `card post ${extraClass}`;
    card.dataset.postId = post.id;
    card.innerHTML = `
        <div class="post-header">
            <div class="post-author">${authorHTML}</div>
            <span class="text-muted post-time">${timeAgo(post.createdAt)}</span>
        </div>
        <div class="post-body">
            <p>${post.content}</p>
        </div>
        <div class="post-footer">
            <button class="btn-action btn-like" data-post-id="${post.id}">
                👍 <span class="like-count">${likeCount}</span>
            </button>
            <button class="btn-action btn-comment">
                💬 <span>${commentCount}</span>
            </button>
        </div>
    `;

    card.querySelector('.btn-like').addEventListener('click', () => toggleLike(post.id, card));

    container.appendChild(card);
}

// --- LIKE TOGGLE ---
async function toggleLike(postId, card) {
    const btn = card.querySelector('.btn-like');
    try {
        const res = await fetch(`${API_URL}/posts/${postId}/like`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${getToken()}` },
        });
        if (res.status === 401 || res.status === 403) { logout(); return; }

        const data = await res.json();
        card.querySelector('.like-count').textContent = data.count;
        btn.classList.toggle('btn-like--active', data.liked);
    } catch (e) {
        console.error('Error al dar like:', e);
    }
}

// --- CREAR POST ---
async function createPost() {
    const contentInput = document.getElementById('postContent');
    const content = contentInput.value.trim();
    if (!content) return alert('El post no puede estar vacío');

    const btn = document.getElementById('btnSubmitPost');
    btn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
            body: JSON.stringify({ content }),
        });

        if (res.ok) {
            contentInput.value = '';
            loadPosts();
        } else if (res.status === 401 || res.status === 403) {
            logout();
        } else {
            const err = await res.json();
            alert('Error al publicar: ' + err.error);
        }
    } catch (e) {
        alert('El servidor no responde.');
    } finally {
        btn.disabled = false;
    }
}
