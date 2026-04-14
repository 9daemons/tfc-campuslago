class ValidationService {
  static ALLOWED_DOMAIN = '@educa.madrid.org';

  static isValidEmail(email) {
    if (typeof email !== 'string') return false;
    return email.toLowerCase().endsWith(this.ALLOWED_DOMAIN);
  }

  static isValidPassword(password) {
    return typeof password === 'string' && password.length >= 8;
  }

  static isValidUsername(username) {
    return typeof username === 'string' && /^[a-zA-Z0-9_]{3,30}$/.test(username);
  }

  static validateRegister({ email, username, full_name, password }) {
    const errors = [];
    if (!email || !username || !full_name || !password) {
      errors.push('Todos los campos son obligatorios.');
    }
    if (email && !this.isValidEmail(email)) {
      errors.push('Solo se permiten cuentas @educa.madrid.org.');
    }
    if (password && !this.isValidPassword(password)) {
      errors.push('La contraseña debe tener al menos 8 caracteres.');
    }
    if (username && !this.isValidUsername(username)) {
      errors.push('El nombre de usuario solo puede contener letras, números y _ (3-30 caracteres).');
    }
    return errors;
  }

  static validateLogin({ email, password }) {
    const errors = [];
    if (!email || !password) errors.push('Email y contraseña requeridos.');
    if (email && !this.isValidEmail(email)) errors.push('Solo se permiten cuentas @educa.madrid.org.');
    return errors;
  }
}

module.exports = ValidationService;
