const ALLOWED_DOMAIN = '@educa.madrid.org';

function isValidEmail(email) {
  return typeof email === 'string' && email.toLowerCase().endsWith(ALLOWED_DOMAIN);
}

function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 8;
}

function isValidUsername(username) {
  return typeof username === 'string' && /^[a-zA-Z0-9_]{3,30}$/.test(username);
}

function validateRegister({ email, username, full_name, password }) {
  const errors = [];
  if (!email || !username || !full_name || !password) {
    errors.push('Todos los campos son obligatorios.');
  }
  if (email && !isValidEmail(email)) {
    errors.push('Solo se permiten cuentas @educa.madrid.org.');
  }
  if (password && !isValidPassword(password)) {
    errors.push('La contraseña debe tener al menos 8 caracteres.');
  }
  if (username && !isValidUsername(username)) {
    errors.push('El nombre de usuario solo puede contener letras, números y _ (3-30 caracteres).');
  }
  return errors;
}

function validateLogin({ email, password }) {
  const errors = [];
  if (!email || !password) errors.push('Email y contraseña requeridos.');
  if (email && !isValidEmail(email)) errors.push('Solo se permiten cuentas @educa.madrid.org.');
  return errors;
}

module.exports = { isValidEmail, isValidPassword, isValidUsername, validateRegister, validateLogin };
