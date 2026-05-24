if (!requireAuth()) throw new Error('Not auth');

const user = getUser();
if (user) {
  document.getElementById('nav-avatar-img').src = avatarUrl(user.avatar);
  document.getElementById('nav-avatar-link').href = `profile.html?u=${user.username}`;
}

let searchTimeout;

function getQuery() {
  const mobile = document.getElementById('search-input-mobile');
  const desktop = document.getElementById('search-input');
  // Usar el que tenga valor, priorizando el visible
  if (mobile && mobile.offsetParent !== null) return mobile.value.trim();
  return desktop ? desktop.value.trim() : '';
}

function onSearchInput() {
  clearTimeout(searchTimeout);
  const q = getQuery();

  // Sincronizar ambos inputs
  const mobile = document.getElementById('search-input-mobile');
  const desktop = document.getElementById('search-input');
  if (mobile && document.activeElement !== mobile && mobile.value !== (desktop?.value ?? '')) mobile.value = desktop?.value ?? '';
  if (desktop && document.activeElement !== desktop && desktop.value !== (mobile?.value ?? '')) desktop.value = mobile?.value ?? '';

  if (!q || q.length < 2) {
    document.getElementById('search-results-users').classList.add('hidden');
    document.getElementById('search-results-posts').classList.add('hidden');
    document.getElementById('search-empty').classList.remove('hidden');
    document.getElementById('search-empty').innerHTML = '<p>Escribe algo para buscar</p>';
    document.title = 'Buscar - Campus Lago';
    return;
  }

  searchTimeout = setTimeout(() => performSearch(q), 300);
}

document.getElementById('search-input')?.addEventListener('input', onSearchInput);
document.getElementById('search-input-mobile')?.addEventListener('input', onSearchInput);

async function performSearch(q) {
  document.title = `Búsqueda: "${q}" - Campus Lago`;
  try {
    const data = await apiFetch(`/search?q=${encodeURIComponent(q)}`);
    document.getElementById('search-empty').classList.add('hidden');

    const usersSection = document.getElementById('search-results-users');
    const usersEl = document.getElementById('users-results');
    if (data.users.length) {
      usersEl.innerHTML = data.users.map(u => `
        <div class="user-result" onclick="window.location.href='profile.html?u=${escapeHtml(u.username)}'">
          <img src="${avatarUrl(u.avatar)}" alt="Avatar de ${escapeHtml(u.full_name || u.username)}">
          <div>
            <strong>${escapeHtml(u.full_name || u.username)}</strong>
            <br><small>@${escapeHtml(u.username)} · <span class="role-badge ${u.role}">${{ student: 'Alumno', teacher: 'Profesor', admin: 'Admin' }[u.role] || u.role}</span></small>
          </div>
        </div>`).join('');
      usersSection.classList.remove('hidden');
    } else {
      usersSection.classList.add('hidden');
    }

    const postsSection = document.getElementById('search-results-posts');
    const postsEl = document.getElementById('posts-results');
    if (data.posts.length) {
      postsEl.innerHTML = data.posts.map(p => `
        <div class="post-card" style="margin-bottom:.5rem;cursor:pointer" onclick="window.location.href='home.html?post=${p.id}'">
          <div class="post-header">
            <img src="${avatarUrl(p.avatar)}" alt="Avatar de ${escapeHtml(p.username)}" style="width:32px;height:32px;border-radius:50%;object-fit:cover">
            <div class="post-header-info">
              <strong>${escapeHtml(p.username)}</strong>
              <small>${timeAgo(p.created_at)}</small>
            </div>
          </div>
          <p class="post-content">${escapeHtml(p.content || '')}</p>
        </div>`).join('');
      postsSection.classList.remove('hidden');
    } else {
      postsSection.classList.add('hidden');
    }

    if (!data.users.length && !data.posts.length) {
      const emptyEl = document.getElementById('search-empty');
      emptyEl.innerHTML = `<p>No se encontraron resultados para <strong>"${escapeHtml(q)}"</strong>.</p>
        <ul class="search-suggestions">
          <li>Comprueba que el nombre esté bien escrito</li>
          <li>Prueba con el nombre de usuario en lugar del nombre completo</li>
          <li>Usa términos más cortos o generales</li>
        </ul>`;
      emptyEl.classList.remove('hidden');
    }
  } catch (e) {
    document.getElementById('search-empty').innerHTML = `<p>${e.message}</p>`;
    document.getElementById('search-empty').classList.remove('hidden');
  }
}

const urlParam = new URLSearchParams(window.location.search).get('q');
if (urlParam && urlParam.length >= 2) {
  const desktop = document.getElementById('search-input');
  const mobile = document.getElementById('search-input-mobile');
  if (desktop) desktop.value = urlParam;
  if (mobile) mobile.value = urlParam;
  performSearch(urlParam);
}
