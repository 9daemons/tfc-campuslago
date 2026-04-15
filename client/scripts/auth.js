// Helper de autenticación — cargado en todas las páginas protegidas
// API_URL viene de config.js, que se carga antes que este script

function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Redirigir a login si no hay sesión activa
if (!getToken()) {
    window.location.href = 'login.html';
}
