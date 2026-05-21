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
    document.title = `${data.full_name || data.username} - Campus Lago`;
    document.getElementById('profile-username').textContent = `@${data.username}`;
    document.getElementById('stat-followers').textContent = data.followers;
    document.getElementById('stat-following').textContent = data.following;
    document.getElementById('profile-bio').textContent = data.bio || '';

    const roleLabel = { student: 'Alumno', teacher: 'Profesor', admin: 'Admin' };
    const badge = document.getElementById('profile-role');
    badge.textContent = roleLabel[data.role] || data.role;
    badge.className = `role-badge ${data.role}`;

    const actions = document.getElementById('profile-actions');
    if (isOwnProfile) {
      actions.innerHTML = `<button class="btn-secondary btn-sm" id="btn-edit-profile">Editar perfil</button>
        <button class="btn-secondary btn-sm btn-logout-red" id="btn-logout">Cerrar sesión</button>`;
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
          if (res.following) {
            showUndoToast(`Siguiendo a ${data.full_name || data.username}`, async () => {
              try {
                await apiFetch(`/users/${data.id}/follow`, { method: 'POST' });
                btn.textContent = 'Seguir';
                btn.className = 'btn-primary btn-sm';
                cnt.textContent = parseInt(cnt.textContent) - 1;
              } catch {}
            });
          }
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
    const canDelete = isOwnProfile || user.role === 'admin';
    container.innerHTML = posts.length
      ? posts.map(p => `
        <article class="post-card" style="margin-bottom:.8rem" data-id="${p.id}">
          ${canDelete ? `<div class="post-header-menu" style="display:flex;justify-content:flex-end;margin-bottom:.3rem">
            <button type="button" class="btn-post-menu" data-id="${p.id}">⋯</button>
            <div class="post-menu-dropdown hidden">
              <button type="button" class="btn-delete-post" data-id="${p.id}">Eliminar post</button>
            </div>
          </div>` : ''}
          ${p.content ? `<p class="post-content">${escapeHtml(p.content)}</p>` : ''}
          ${p.image_url ? `<img class="post-image" src="${avatarUrl(p.image_url)}" alt="">` : ''}
          <div class="post-actions">
            <span class="post-action-btn">❤ ${p.likes_count}</span>
            <span class="post-action-btn">💬 ${p.comments_count}</span>
            <small style="margin-left:auto;color:var(--text-muted)">${timeAgo(p.created_at)}</small>
          </div>
        </article>`).join('')
      : '<p class="loading">Sin posts aún.</p>';

    if (canDelete) {
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

    const fresh = await apiFetch(`/users/${user.username}`);
    const stored = getUser();
    if (stored) {
      stored.full_name = fresh.full_name || full_name;
      stored.bio = fresh.bio || bio;
      stored.avatar = fresh.avatar || stored.avatar;
      localStorage.setItem('user', JSON.stringify(stored));
      document.getElementById('nav-avatar-img').src = avatarUrl(stored.avatar);
    }

    loadProfile();
    loadUserPosts();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  }
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.post-header-menu')) {
    document.querySelectorAll('.post-menu-dropdown').forEach(d => d.classList.add('hidden'));
  }
});

const navSearchRedirect = document.getElementById('nav-search-redirect');
if (navSearchRedirect) {
  navSearchRedirect.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = navSearchRedirect.value.trim();
      if (q.length >= 2) window.location.href = `search.html?q=${encodeURIComponent(q)}`;
    }
  });
}
