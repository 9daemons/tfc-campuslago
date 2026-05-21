if (!requireAuth()) throw new Error('Not auth');

const user = getUser();
let activeCommentPostId = null;

if (user) {
  document.getElementById('nav-avatar-img').src = avatarUrl(user.avatar);
  document.getElementById('nav-avatar-link').href = `profile.html?u=${user.username}`;
  if (user.role === 'admin') document.getElementById('nav-messages').classList.add('hidden');
}

const isAdmin = user?.role === 'admin';
Promise.all([
  loadUnifiedFeed(),
  isAdmin ? loadAdminRequests() : loadRecentMessages(),
  loadNotifications(),
  loadSuggestedUsers()
]);

async function loadUnifiedFeed() {
  const container = document.getElementById('feed-unified');
  try {
    const [official, student] = await Promise.all([
      apiFetch('/posts/feed/official'),
      apiFetch('/posts/feed/student')
    ]);

    const all = [
      ...official.map(p => ({ ...p, _type: 'official' })),
      ...student.map(p => ({ ...p, _type: 'student' }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    container.innerHTML = all.length
      ? all.map(renderPost).join('')
      : '<p class="loading">Sin publicaciones aún.</p>';

    attachPostActions('feed-unified');
  } catch (e) {
    container.innerHTML = `<p class="loading">${e.message}</p>`;
  }
}

function renderPost(p) {
  const isOfficial = p._type === 'official';
  const isOwn = user.role === 'admin' || (!isOfficial && p.user_id == user.id);
  const nameClass = (!isOfficial && p.role === 'teacher') ? 'post-author-teacher' : '';
  const name = isOfficial
    ? (p.is_anonymous ? 'IES El Lago' : escapeHtml(p.full_name || p.username))
    : escapeHtml(p.full_name || p.username);
  const av = (isOfficial && p.is_anonymous) ? 'assets/default-avatar.svg' : avatarUrl(p.avatar);

  return `
  <article class="post-card${isOfficial ? ' official' : ''}" data-id="${p.id}">
    ${isOfficial ? '<span class="post-official-label">📢 Noticia del centro</span>' : ''}
    <div class="post-header">
      <img src="${av}" alt="">
      <div class="post-header-info">
        <strong>${isOfficial ? name : `<a href="profile.html?u=${escapeHtml(p.username)}" class="${nameClass}">${name}</a>`}</strong>
        <small>${timeAgo(p.created_at)}</small>
      </div>
      ${isOwn ? `<div class="post-header-menu">
        <button type="button" class="btn-post-menu" data-id="${p.id}">⋯</button>
        <div class="post-menu-dropdown hidden">
          <button type="button" class="btn-delete-post" data-id="${p.id}">Eliminar post</button>
        </div>
      </div>` : ''}
    </div>
    ${p.content ? `<p class="post-content">${escapeHtml(p.content)}</p>` : ''}
    ${p.image_url ? `<img class="post-image" src="${avatarUrl(p.image_url)}" alt="">` : ''}
    <div class="post-actions">
      <button type="button" class="post-action-btn btn-like ${p.liked ? 'liked' : ''}" data-id="${p.id}">
        ❤ <span class="like-count">${p.likes_count}</span>
      </button>
      <button type="button" class="post-action-btn btn-comment" data-id="${p.id}">
        💬 ${p.comments_count}
      </button>
    </div>
  </article>`;
}

function attachPostActions(containerId) {
  const container = document.getElementById(containerId);

  container.querySelectorAll('.btn-like').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        const res = await apiFetch(`/posts/${btn.dataset.id}/like`, { method: 'POST' });
        btn.classList.toggle('liked', res.liked);
        const countEl = btn.querySelector('.like-count');
        countEl.textContent = parseInt(countEl.textContent) + (res.liked ? 1 : -1);
      } catch (e) { console.error('Like error:', e.message); }
    });
  });

  container.querySelectorAll('.btn-comment').forEach(btn => {
    btn.addEventListener('click', () => openComments(btn.dataset.id));
  });

  container.querySelectorAll('.btn-post-menu').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const dropdown = btn.nextElementSibling;
      document.querySelectorAll('.post-menu-dropdown').forEach(d => { if (d !== dropdown) d.classList.add('hidden'); });
      dropdown.classList.toggle('hidden');
    });
  });

  container.querySelectorAll('.btn-delete-post').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.closest('.post-menu-dropdown').classList.add('hidden');
      if (!confirm('¿Eliminar este post?')) return;
      try {
        await apiFetch(`/posts/${btn.dataset.id}`, { method: 'DELETE' });
        btn.closest('.post-card').remove();
      } catch (e) { alert(e.message); }
    });
  });
}

// Modal nuevo post
document.getElementById('btn-new-post').addEventListener('click', () => {
  document.getElementById('modal-post').classList.remove('hidden');
});

document.getElementById('btn-close-post').addEventListener('click', () => {
  document.getElementById('modal-post').classList.add('hidden');
  document.getElementById('form-post').reset();
  document.getElementById('post-image-preview').classList.add('hidden');
});

document.getElementById('post-image').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const preview = document.getElementById('post-image-preview');
  preview.src = URL.createObjectURL(file);
  preview.classList.remove('hidden');
});

document.getElementById('form-post').addEventListener('submit', async (e) => {
  e.preventDefault();
  const content = document.getElementById('post-content').value.trim();
  const imageFile = document.getElementById('post-image').files[0];
  const errEl = document.getElementById('post-error');
  errEl.classList.add('hidden');

  if (!content && !imageFile) {
    errEl.textContent = 'Escribe algo o añade una imagen.';
    errEl.classList.remove('hidden');
    return;
  }

  const fd = new FormData();
  if (content) fd.append('content', content);
  if (imageFile) fd.append('image', imageFile);

  const submitBtn = e.target.querySelector('[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = imageFile ? 'Subiendo...' : 'Publicando...';

  try {
    await apiFetch('/posts', { method: 'POST', body: fd });
    document.getElementById('modal-post').classList.add('hidden');
    document.getElementById('form-post').reset();
    document.getElementById('post-image-preview').classList.add('hidden');
    loadUnifiedFeed();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Publicar';
  }
});

// Comentarios
async function openComments(postId) {
  activeCommentPostId = postId;
  const list = document.getElementById('comments-list');
  list.innerHTML = '<div class="loading">Cargando...</div>';
  document.getElementById('modal-comments').classList.remove('hidden');

  try {
    const comments = await apiFetch(`/posts/${postId}/comments`);
    list.innerHTML = comments.length
      ? comments.map(c => `
        <article class="post-card comment-card">
          <div class="post-header">
            <img src="${avatarUrl(c.avatar)}" alt="" class="comment-avatar">
            <div class="post-header-info">
              <strong>${escapeHtml(c.username)}</strong>
              <small>${timeAgo(c.created_at)}</small>
            </div>
          </div>
          <p class="post-content">${escapeHtml(c.content)}</p>
        </article>`).join('')
      : '<p class="loading">Sin comentarios aún.</p>';
  } catch (e) {
    list.innerHTML = `<p class="loading">${e.message}</p>`;
  }
}

document.getElementById('btn-close-comments').addEventListener('click', () => {
  document.getElementById('modal-comments').classList.add('hidden');
});

document.getElementById('form-comment').addEventListener('submit', async (e) => {
  e.preventDefault();
  const content = document.getElementById('comment-input').value.trim();
  if (!content || !activeCommentPostId) return;
  try {
    await apiFetch(`/posts/${activeCommentPostId}/comments`, { method: 'POST', body: { content } });
    document.getElementById('comment-input').value = '';
    openComments(activeCommentPostId);
  } catch (e) { alert(e.message); }
});

// Notificaciones
async function loadNotifications() {
  try {
    const notifs = await apiFetch('/notifications');
    const unread = notifs.filter(n => !n.is_read).length;
    const badge = document.getElementById('notif-count');
    badge.textContent = unread;
    badge.classList.toggle('hidden', unread === 0);

    document.getElementById('notif-list').innerHTML = notifs.length
      ? notifs.map(n => `<div class="notif-item ${n.is_read ? '' : 'unread'}">${escapeHtml(n.message)}<br><small>${timeAgo(n.created_at)}</small></div>`).join('')
      : '<div class="notif-item">Sin notificaciones.</div>';
  } catch {}
}

document.getElementById('btn-notif').addEventListener('click', () => {
  document.getElementById('notif-dropdown').classList.toggle('hidden');
});

document.getElementById('btn-mark-read').addEventListener('click', async () => {
  try {
    await apiFetch('/notifications/read-all', { method: 'PUT' });
    loadNotifications();
  } catch {}
});

// Mensajes recientes
async function loadRecentMessages() {
  const container = document.getElementById('sidebar-left-body');
  try {
    const convs = await apiFetch('/messages/conversations');
    if (!convs.length) { container.innerHTML = '<small class="loading">Sin mensajes.</small>'; return; }
    container.innerHTML = convs.slice(0, 3).map(c => {
      const dName = c.is_group ? (c.name || 'Grupo') : (c.other_name || c.other_username || 'Chat');
      const dAvatar = !c.is_group && c.other_avatar ? avatarUrl(c.other_avatar) : 'assets/default-avatar.svg';
      return `<div class="message-preview">
        <img src="${dAvatar}" alt="">
        <div class="message-preview-text">
          <strong>${escapeHtml(dName)}</strong>
          <small>${escapeHtml(c.last_message || '')}</small>
        </div>
      </div>`;
    }).join('');
    container.querySelectorAll('.message-preview').forEach(el => {
      el.addEventListener('click', () => { window.location.href = 'messages.html'; });
    });
  } catch {}
}

// Solicitudes de registro (solo admin)
async function loadAdminRequests() {
  document.getElementById('sidebar-left-title').textContent = 'Solicitudes de registro';
  document.getElementById('sidebar-messages-link').classList.add('hidden');
  const container = document.getElementById('sidebar-left-body');
  try {
    const requests = await apiFetch('/users/admin/requests');
    const pending = requests.filter(r => r.status === 'pending');
    if (!pending.length) {
      container.innerHTML = '<small class="loading">Sin solicitudes pendientes.</small>';
      return;
    }
    container.innerHTML = pending.map(r => `
      <div class="admin-request-card" data-id="${r.id}">
        <div class="admin-request-info">
          <strong>${escapeHtml(r.full_name)}</strong>
          <span>@${escapeHtml(r.username)}</span>
          <small>${escapeHtml(r.email)}</small>
        </div>
        <div class="admin-request-actions">
          <select class="admin-role-select" data-id="${r.id}">
            <option value="student">Alumno</option>
            <option value="teacher">Profesor</option>
          </select>
          <button type="button" class="btn-primary btn-sm btn-approve" data-id="${r.id}">Aprobar</button>
          <button type="button" class="btn-danger btn-primary btn-sm btn-reject" data-id="${r.id}">Rechazar</button>
        </div>
      </div>`).join('');

    container.querySelectorAll('.btn-approve').forEach(btn => {
      btn.addEventListener('click', async () => {
        const role = container.querySelector(`.admin-role-select[data-id="${btn.dataset.id}"]`).value;
        try {
          await apiFetch(`/users/admin/requests/${btn.dataset.id}/approve`, { method: 'POST', body: { role } });
          btn.closest('.admin-request-card').remove();
          if (!container.querySelector('.admin-request-card'))
            container.innerHTML = '<small class="loading">Sin solicitudes pendientes.</small>';
        } catch (e) { alert(e.message); }
      });
    });

    container.querySelectorAll('.btn-reject').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('¿Rechazar esta solicitud?')) return;
        try {
          await apiFetch(`/users/admin/requests/${btn.dataset.id}/reject`, { method: 'POST' });
          btn.closest('.admin-request-card').remove();
          if (!container.querySelector('.admin-request-card'))
            container.innerHTML = '<small class="loading">Sin solicitudes pendientes.</small>';
        } catch (e) { alert(e.message); }
      });
    });
  } catch (e) {
    container.innerHTML = `<small class="loading">${e.message}</small>`;
  }
}

// Sugerencias de usuarios
async function loadSuggestedUsers() {
  const container = document.getElementById('suggested-users');
  if (!container) return;
  try {
    const candidates = await apiFetch('/users/me/suggested');

    if (!candidates.length) {
      container.innerHTML = '<small class="loading">Sin sugerencias.</small>';
      return;
    }

    container.innerHTML = candidates.map(u => `
      <div class="suggested-user">
        <img src="${avatarUrl(u.avatar)}" alt="">
        <div class="suggested-user-info">
          <strong>${escapeHtml(u.full_name || u.username)}</strong>
          <small>@${escapeHtml(u.username)}</small>
        </div>
        <button type="button" class="btn-follow-sm" data-id="${u.id}">Seguir</button>
      </div>`).join('');

    container.querySelectorAll('.btn-follow-sm').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await apiFetch(`/users/${btn.dataset.id}/follow`, { method: 'POST' });
          const name = btn.closest('.suggested-user').querySelector('strong').textContent;
          btn.textContent = 'Siguiendo';
          btn.disabled = true;
          btn.classList.add('following');
          showUndoToast(`Siguiendo a ${name}`, async () => {
            try {
              await apiFetch(`/users/${btn.dataset.id}/follow`, { method: 'POST' });
              btn.textContent = 'Seguir';
              btn.disabled = false;
              btn.classList.remove('following');
            } catch {}
          });
        } catch {}
      });
    });
  } catch {
    container.innerHTML = '<small class="loading">Sin sugerencias.</small>';
  }
}

// Búsqueda
const navSearch = document.getElementById('nav-search');
const searchResultsEl = document.getElementById('search-results');
let searchTimeout;

navSearch.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  const q = navSearch.value.trim();
  if (!q || q.length < 2) { searchResultsEl.classList.add('hidden'); return; }
  searchTimeout = setTimeout(async () => {
    try {
      const data = await apiFetch(`/search?q=${encodeURIComponent(q)}`);
      const items = [
        ...data.users.map(u => `<div class="search-result-item" onclick="window.location.href='profile.html?u=${escapeHtml(u.username)}'">
          <img src="${avatarUrl(u.avatar)}" alt="">
          <div><strong>${escapeHtml(u.username)}</strong><br><small>${escapeHtml(u.full_name || '')}</small></div>
        </div>`),
        ...data.posts.map(p => `<div class="search-result-item">
          <img src="${avatarUrl(p.avatar)}" alt="">
          <div><strong>${escapeHtml(p.username)}</strong><br><small>${escapeHtml(p.content?.substring(0, 60) || '')}</small></div>
        </div>`)
      ];
      searchResultsEl.innerHTML = items.length ? items.join('') : '<div class="search-result-item">Sin resultados.</div>';
      searchResultsEl.classList.remove('hidden');
    } catch {}
  }, 300);
});

document.addEventListener('click', (e) => {
  if (!navSearch.contains(e.target) && !searchResultsEl.contains(e.target)) {
    searchResultsEl.classList.add('hidden');
  }
  if (!document.getElementById('btn-notif').contains(e.target) && !document.getElementById('notif-dropdown').contains(e.target)) {
    document.getElementById('notif-dropdown').classList.add('hidden');
  }
  if (!e.target.closest('.post-header-menu')) {
    document.querySelectorAll('.post-menu-dropdown').forEach(d => d.classList.add('hidden'));
  }
});
