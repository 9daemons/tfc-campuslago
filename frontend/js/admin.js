const user = requireAuth();
if (user.role !== 'admin') window.location.href = 'home.html';

const navAvatar = document.getElementById('nav-avatar-img');
const navAvatarLink = document.getElementById('nav-avatar-link');
if (navAvatar) navAvatar.src = avatarUrl(user.avatar);
if (navAvatarLink) navAvatarLink.href = 'profile.html';

document.getElementById('btn-theme').addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  document.getElementById('btn-theme').textContent = document.documentElement.classList.contains('dark') ? '☀️' : '🌙';
});

document.getElementById('btn-close-pin').addEventListener('click', () => {
  document.getElementById('modal-pin').classList.add('hidden');
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.getElementById('modal-pin').classList.add('hidden');
});

document.getElementById('user-search').addEventListener('input', filterUsers);
document.getElementById('role-filter').addEventListener('change', filterUsers);

let allUsers = [];

Promise.all([loadPendingRequests(), loadUsers()]);

async function loadPendingRequests() {
  const container = document.getElementById('pending-list');
  try {
    const requests = await apiFetch('/users/admin/requests');
    const pending = requests.filter(r => r.status === 'pending');
    const badge = document.getElementById('pending-count');

    if (pending.length > 0) {
      badge.textContent = pending.length;
      badge.classList.remove('hidden');
    }

    if (pending.length === 0) {
      container.innerHTML = '<p class="admin-empty">No hay solicitudes pendientes.</p>';
      return;
    }

    container.innerHTML = pending.map(r => `
      <div class="admin-request-card" id="req-${r.id}">
        <div class="admin-request-info">
          <strong>${escapeHtml(r.full_name)}</strong>
          <span>@${escapeHtml(r.username)}</span>
          <span class="text-muted-sm">${escapeHtml(r.email)}</span>
          <small class="text-muted-sm">${timeAgo(r.created_at)}</small>
        </div>
        <div class="admin-request-actions">
          <select class="admin-select admin-select-sm" id="role-req-${r.id}" aria-label="Rol para ${escapeHtml(r.full_name)}">
            <option value="student">Alumno</option>
            <option value="teacher">Profesor</option>
          </select>
          <button class="btn-primary btn-sm" onclick="approveRequest(${r.id})">Aprobar</button>
          <button class="btn-danger btn-sm" onclick="rejectRequest(${r.id})">Rechazar</button>
        </div>
      </div>
    `).join('');
  } catch {
    container.innerHTML = '<p class="admin-empty">Error al cargar solicitudes.</p>';
  }
}

async function approveRequest(id) {
  const roleEl = document.getElementById(`role-req-${id}`);
  const role = roleEl ? roleEl.value : 'student';
  try {
    await apiFetch(`/users/admin/requests/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ role })
    });
    removeRequestCard(id);
  } catch {
    alert('Error al aprobar la solicitud.');
  }
}

async function rejectRequest(id) {
  if (!confirm('¿Rechazar esta solicitud?')) return;
  try {
    await apiFetch(`/users/admin/requests/${id}/reject`, { method: 'POST' });
    removeRequestCard(id);
  } catch {
    alert('Error al rechazar la solicitud.');
  }
}

function removeRequestCard(id) {
  document.getElementById(`req-${id}`)?.remove();
  const remaining = document.querySelectorAll('[id^="req-"]').length;
  const badge = document.getElementById('pending-count');
  if (remaining === 0) {
    badge.classList.add('hidden');
    document.getElementById('pending-list').innerHTML = '<p class="admin-empty">No hay solicitudes pendientes.</p>';
  } else {
    badge.textContent = remaining;
  }
}

async function loadUsers() {
  const container = document.getElementById('users-list');
  try {
    allUsers = await apiFetch('/users/admin/users');
    renderUsers(allUsers);
  } catch {
    container.innerHTML = '<p class="admin-empty">Error al cargar usuarios.</p>';
  }
}

function renderUsers(users) {
  const container = document.getElementById('users-list');
  if (users.length === 0) {
    container.innerHTML = '<p class="admin-empty">No hay usuarios que coincidan.</p>';
    return;
  }
  container.innerHTML = users.map(u => `
    <div class="admin-user-row${u.is_active ? '' : ' admin-user-suspended'}" id="user-${u.id}">
      <img src="${avatarUrl(u.avatar)}" alt="Avatar de ${escapeHtml(u.full_name || u.username)}" class="admin-user-avatar">
      <div class="admin-user-info">
        <strong>${escapeHtml(u.full_name || u.username)}</strong>
        <span class="text-muted-sm">@${escapeHtml(u.username)} · ${escapeHtml(u.email)}</span>
        <small class="text-muted-sm">${u.posts_count} posts · ${u.comments_count} comentarios · ${u.last_login ? 'Último acceso: ' + timeAgo(u.last_login) : 'Sin accesos registrados'}</small>
      </div>
      <div class="admin-user-actions">
        <select class="admin-select admin-select-sm" onchange="changeRole(${u.id}, this.value)" aria-label="Cambiar rol de ${escapeHtml(u.full_name || u.username)}">
          <option value="student"${u.role === 'student' ? ' selected' : ''}>Alumno</option>
          <option value="teacher"${u.role === 'teacher' ? ' selected' : ''}>Profesor</option>
        </select>
        <a href="profile.html?u=${encodeURIComponent(u.username)}" class="btn-sm btn-secondary" target="_blank">Ver perfil</a>
        <button class="btn-sm ${u.is_active ? 'btn-warning' : 'btn-success'}" onclick="toggleSuspend(${u.id})" aria-label="${u.is_active ? 'Suspender' : 'Activar'} cuenta de ${escapeHtml(u.full_name || u.username)}">
          ${u.is_active ? 'Suspender' : 'Activar'}
        </button>
        <button class="btn-sm btn-secondary" onclick="resetPin(${u.id})" aria-label="Generar PIN de recuperación para ${escapeHtml(u.full_name || u.username)}">Reset PIN</button>
        <button class="btn-sm btn-danger" onclick="deleteUser(${u.id}, '${escapeHtml(u.full_name || u.username).replace(/'/g, "\\'")}')" aria-label="Eliminar cuenta de ${escapeHtml(u.full_name || u.username)}">Eliminar</button>
      </div>
    </div>
  `).join('');
}

function filterUsers() {
  const query = document.getElementById('user-search').value.toLowerCase();
  const role = document.getElementById('role-filter').value;
  const filtered = allUsers.filter(u => {
    const matchesQuery = !query ||
      (u.full_name || '').toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.username.toLowerCase().includes(query);
    const matchesRole = !role || u.role === role;
    return matchesQuery && matchesRole;
  });
  renderUsers(filtered);
}

async function changeRole(id, role) {
  try {
    await apiFetch(`/users/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
    const u = allUsers.find(u => u.id === id);
    if (u) u.role = role;
  } catch {
    alert('Error al cambiar el rol.');
    loadUsers();
  }
}

async function toggleSuspend(id) {
  try {
    const { is_active } = await apiFetch(`/users/admin/users/${id}/suspend`, { method: 'PUT' });
    const u = allUsers.find(u => u.id === id);
    if (u) u.is_active = is_active;
    const row = document.getElementById(`user-${id}`);
    if (!row) return;
    row.classList.toggle('admin-user-suspended', !is_active);
    const btn = row.querySelector('.btn-warning, .btn-success');
    if (btn) {
      btn.textContent = is_active ? 'Suspender' : 'Activar';
      btn.className = `btn-sm ${is_active ? 'btn-warning' : 'btn-success'}`;
      btn.setAttribute('aria-label', `${is_active ? 'Suspender' : 'Activar'} cuenta`);
    }
  } catch {
    alert('Error al cambiar el estado de la cuenta.');
  }
}

async function resetPin(id) {
  try {
    const { pin, email, full_name } = await apiFetch(`/users/admin/users/${id}/reset-pin`, { method: 'POST' });
    document.getElementById('pin-user-info').textContent = `PIN generado para ${full_name} (${email})`;
    document.getElementById('pin-code').textContent = pin;
    document.getElementById('modal-pin').classList.remove('hidden');
  } catch {
    alert('Error al generar el PIN.');
  }
}

async function deleteUser(id, name) {
  if (!confirm(`¿Eliminar la cuenta de ${name}? Esta acción no se puede deshacer y borrará todos sus posts, comentarios y mensajes.`)) return;
  try {
    await apiFetch(`/users/admin/users/${id}`, { method: 'DELETE' });
    document.getElementById(`user-${id}`)?.remove();
    allUsers = allUsers.filter(u => u.id !== id);
  } catch {
    alert('Error al eliminar la cuenta.');
  }
}
