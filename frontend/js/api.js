function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/index.html';
}

function httpErrorMessage(status) {
  if (status === 400) return 'Solicitud incorrecta.';
  if (status === 403) return 'No tienes permisos para realizar esta acción.';
  if (status === 404) return 'El recurso solicitado no existe.';
  if (status === 409) return 'Conflicto con el estado actual del recurso.';
  if (status === 429) return 'Demasiadas solicitudes. Espera un momento.';
  if (status >= 500) return 'Error interno del servidor. Inténtalo más tarde.';
  return 'Error desconocido.';
}

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...(options.headers || {}) };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error('Sin conexión con el servidor. Comprueba tu red.');
  }

  if (res.status === 401) { logout(); return; }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || httpErrorMessage(res.status));
    err.status = res.status;
    throw err;
  }
  return data;
}

function getUser() {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
}

function requireAuth() {
  const token = localStorage.getItem('token');
  if (!token) { logout(); return false; }
  return true;
}

function avatarUrl(path) {
  if (!path) return 'assets/default-avatar.svg';
  if (path.startsWith('http')) return path;
  return `${API_BASE.replace('/api', '')}${path}`;
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'ahora';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function escapeHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
