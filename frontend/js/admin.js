if (!requireAuth()) throw new Error('Not auth');

const user = getUser();
if (!user || user.role !== 'admin') window.location.href = 'home.html';

if (user) {
  document.getElementById('nav-avatar-img').src = avatarUrl(user.avatar);
  document.getElementById('nav-avatar-link').href = `profile.html?u=${user.username}`;
}

loadRequests();

async function loadRequests() {
  const container = document.getElementById('requests-list');
  try {
    const requests = await apiFetch('/users/admin/requests');
    const pending = requests.filter(r => r.status === 'pending');

    if (!pending.length) {
      container.innerHTML = '<p class="loading">No hay solicitudes pendientes.</p>';
      return;
    }

    container.innerHTML = pending.map(r => `
      <div class="admin-request-card" data-id="${r.id}">
        <div class="admin-request-info">
          <strong>${escapeHtml(r.full_name)}</strong>
          <span>@${escapeHtml(r.username)}</span>
          <small>${escapeHtml(r.email)}</small>
          <small class="text-muted">${timeAgo(r.created_at)}</small>
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
          if (!container.querySelector('.admin-request-card')) {
            container.innerHTML = '<p class="loading">No hay solicitudes pendientes.</p>';
          }
        } catch (e) { alert(e.message); }
      });
    });

    container.querySelectorAll('.btn-reject').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('¿Rechazar esta solicitud?')) return;
        try {
          await apiFetch(`/users/admin/requests/${btn.dataset.id}/reject`, { method: 'POST' });
          btn.closest('.admin-request-card').remove();
          if (!container.querySelector('.admin-request-card')) {
            container.innerHTML = '<p class="loading">No hay solicitudes pendientes.</p>';
          }
        } catch (e) { alert(e.message); }
      });
    });
  } catch (e) {
    container.innerHTML = `<p class="loading">${e.message}</p>`;
  }
}
