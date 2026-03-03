if (!requireAuth()) throw new Error('Not auth');

const user = getUser();
const urlParams = new URLSearchParams(window.location.search);
const targetUsername = urlParams.get('u') || user?.username;
const isOwnProfile = targetUsername === user?.username;

if (user) {
  document.getElementById('nav-avatar-img').src = avatarUrl(user.avatar);
  document.getElementById('nav-avatar-link').href = `profile.html?u=${user.username}`;
}

loadProfile();
loadUserPosts();

async function loadProfile() {
  try {
    const data = await apiFetch(`/users/${targetUsername}`);

    document.getElementById('profile-avatar').src = avatarUrl(data.avatar);
    document.getElementById('profile-name').textContent = data.full_name || data.username;
    document.getElementById('profile-username').textContent = `@${data.username}`;
    document.getElementById('stat-followers').textContent = data.followers;
    document.getElementById('stat-following').textContent = data.following;
    document.getElementById('profile-bio').textContent = data.bio || '';

    const badge = document.getElementById('profile-role');
    badge.textContent = data.role;
    badge.className = `role-badge ${data.role}`;

    const actions = document.getElementById('profile-actions');
    if (isOwnProfile) {
      actions.innerHTML = `<button class="btn-secondary" id="btn-edit-profile">Editar perfil</button>
        <button class="btn-danger btn-primary btn-sm" id="btn-logout" style="margin-left:.5rem">Cerrar sesión</button>`;
      document.getElementById('btn-edit-profile').addEventListener('click', () => {
        document.getElementById('edit-name').value = data.full_name || '';
        document.getElementById('edit-bio').value = data.bio || '';
        document.getElementById('modal-edit').classList.remove('hidden');
      });
      document.getElementById('btn-logout').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
      });
    } else {
      actions.innerHTML = `<button class="btn-${data.is_following ? 'secondary' : 'primary'} btn-sm" id="btn-follow" data-id="${data.id}">
        ${data.is_following ? 'Siguiendo' : 'Seguir'}
      </button>`;
      document.getElementById('btn-follow').addEventListener('click', async () => {
        try {
          const res = await apiFetch(`/users/${data.id}/follow`, { method: 'POST' });
          const btn = document.getElementById('btn-follow');
          btn.textContent = res.following ? 'Siguiendo' : 'Seguir';
          btn.className = `btn-${res.following ? 'secondary' : 'primary'} btn-sm`;
          const cnt = document.getElementById('stat-followers');
          cnt.textContent = parseInt(cnt.textContent) + (res.following ? 1 : -1);
        } catch (e) { alert(e.message); }
      });
    }
  } catch (e) {
    document.getElementById('profile-name').textContent = 'Usuario no encontrado';
  }
}

async function loadUserPosts() {
  const container = document.getElementById('profile-posts-list');
  try {
    const posts = await apiFetch(`/users/${targetUsername}/posts`);
    container.innerHTML = posts.length
      ? posts.map(p => `
        <div class="post-card" style="margin-bottom:.8rem">
          ${p.content ? `<p class="post-content">${escapeHtml(p.content)}</p>` : ''}
          ${p.image_url ? `<img class="post-image" src="${avatarUrl(p.image_url)}" alt="">` : ''}
          <div class="post-actions">
            <span class="post-action-btn">❤ ${p.likes_count}</span>
            <span class="post-action-btn">💬 ${p.comments_count}</span>
            <small style="margin-left:auto;color:var(--text-muted)">${timeAgo(p.created_at)}</small>
          </div>
        </div>`).join('')
      : '<p class="loading">Sin posts aún.</p>';
    const statPosts = document.getElementById('stat-posts');
    if (statPosts) statPosts.textContent = posts.length;
  } catch (e) {
    container.innerHTML = `<p class="loading">${e.message}</p>`;
  }
}

// Edit profile modal
document.getElementById('btn-close-edit')?.addEventListener('click', () => {
  document.getElementById('modal-edit').classList.add('hidden');
});

document.getElementById('form-edit-profile')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const full_name = document.getElementById('edit-name').value.trim();
  const bio = document.getElementById('edit-bio').value.trim();
  const avatarFile = document.getElementById('edit-avatar').files[0];
  const errEl = document.getElementById('edit-error');
  errEl.classList.add('hidden');

  const fd = new FormData();
  fd.append('full_name', full_name);
  fd.append('bio', bio);
  if (avatarFile) fd.append('avatar', avatarFile);

  try {
    await apiFetch('/users/me/profile', { method: 'PUT', body: fd });
    document.getElementById('modal-edit').classList.add('hidden');
    loadProfile();
    loadUserPosts();

    const stored = getUser();
    if (stored) {
      stored.full_name = full_name;
      stored.bio = bio;
      localStorage.setItem('user', JSON.stringify(stored));
    }
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  }
});
