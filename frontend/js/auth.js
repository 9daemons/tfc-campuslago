// Redirect if already logged in
if (localStorage.getItem('token')) {
  window.location.href = 'home.html';
}

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`panel-${btn.dataset.tab}`).classList.add('active');
  });
});

// Login
document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  errEl.classList.add('hidden');

  if (!email.toLowerCase().endsWith(ALLOWED_DOMAIN)) {
    errEl.textContent = 'Solo se permiten cuentas @educa.madrid.org.';
    errEl.classList.remove('hidden');
    return;
  }

  const btn = document.getElementById('btn-login');
  btn.disabled = true;
  btn.textContent = 'Entrando...';

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión.');

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = 'home.html';
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Entrar';
  }
});

// Register
document.getElementById('form-register').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('reg-email').value.trim();
  const username = document.getElementById('reg-username').value.trim();
  const full_name = document.getElementById('reg-name').value.trim();
  const password = document.getElementById('reg-password').value;
  const errEl = document.getElementById('reg-error');
  const okEl = document.getElementById('reg-success');
  errEl.classList.add('hidden');
  okEl.classList.add('hidden');

  if (!email.toLowerCase().endsWith(ALLOWED_DOMAIN)) {
    errEl.textContent = 'Solo se permiten cuentas @educa.madrid.org.';
    errEl.classList.remove('hidden');
    return;
  }

  const btn = document.getElementById('btn-register');
  btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, full_name, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    okEl.textContent = data.message;
    okEl.classList.remove('hidden');
    document.getElementById('form-register').reset();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
  }
});

// Forgot password link
document.getElementById('btn-forgot').addEventListener('click', () => {
  document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-forgot').classList.add('active');
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
});

document.getElementById('btn-back-login').addEventListener('click', () => {
  document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-login').classList.add('active');
  document.querySelector('[data-tab="login"]').classList.add('active');
});

// Forgot password
let forgotEmail = '';
document.getElementById('form-forgot').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('forgot-email').value.trim();
  const errEl = document.getElementById('forgot-error');
  const okEl = document.getElementById('forgot-success');
  errEl.classList.add('hidden');
  okEl.classList.add('hidden');

  if (!email.toLowerCase().endsWith(ALLOWED_DOMAIN)) {
    errEl.textContent = 'Solo se permiten cuentas @educa.madrid.org.';
    errEl.classList.remove('hidden');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    forgotEmail = email;
    okEl.textContent = data.message;
    okEl.classList.remove('hidden');
    document.getElementById('form-forgot').classList.add('hidden');
    document.getElementById('form-reset').classList.remove('hidden');
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  }
});

// Reset password
document.getElementById('form-reset').addEventListener('submit', async (e) => {
  e.preventDefault();
  const pin = document.getElementById('reset-pin').value.trim();
  const new_password = document.getElementById('reset-password').value;
  const errEl = document.getElementById('reset-error');
  const okEl = document.getElementById('reset-success');
  errEl.classList.add('hidden');
  okEl.classList.add('hidden');

  try {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotEmail, pin, new_password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    okEl.textContent = 'Contraseña cambiada. Puedes iniciar sesión.';
    okEl.classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('form-reset').classList.add('hidden');
      document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('panel-login').classList.add('active');
      document.querySelector('[data-tab="login"]').classList.add('active');
    }, 2000);
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  }
});
