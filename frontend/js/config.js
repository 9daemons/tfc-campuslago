const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE = isLocal
  ? 'http://localhost:3000/api'
  : 'https://RENDER_URL_AQUI.onrender.com/api';

const ALLOWED_DOMAIN = '@educa.madrid.org';
