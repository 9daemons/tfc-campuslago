// Detecta automáticamente si estás en local o en producción
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/api'
    : 'https://campus-lago.onrender.com/api'; // ← Pon aquí la URL de Render
