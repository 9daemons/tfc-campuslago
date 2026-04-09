const { isValidEmail, isValidPassword, isValidUsername, validateRegister, validateLogin } = require('../src/services/validation');

describe('isValidEmail', () => {
  test('acepta emails @educa.madrid.org', () => {
    expect(isValidEmail('alumno@educa.madrid.org')).toBe(true);
  });
  test('acepta emails de admin del dominio correcto', () => {
    expect(isValidEmail('admin@educa.madrid.org')).toBe(true);
  });
  test('rechaza emails de otros dominios', () => {
    expect(isValidEmail('alumno@gmail.com')).toBe(false);
    expect(isValidEmail('alumno@hotmail.com')).toBe(false);
  });
  test('rechaza valores no string', () => {
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
    expect(isValidEmail(123)).toBe(false);
  });
  test('rechaza string vacío', () => {
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isValidPassword', () => {
  test('acepta contraseñas de exactamente 8 caracteres', () => {
    expect(isValidPassword('12345678')).toBe(true);
  });
  test('acepta contraseñas largas', () => {
    expect(isValidPassword('contraseñaSegura123!')).toBe(true);
  });
  test('rechaza contraseñas de menos de 8 caracteres', () => {
    expect(isValidPassword('corto')).toBe(false);
    expect(isValidPassword('1234567')).toBe(false);
  });
  test('rechaza string vacío', () => {
    expect(isValidPassword('')).toBe(false);
  });
});

describe('isValidUsername', () => {
  test('acepta nombres alfanuméricos válidos', () => {
    expect(isValidUsername('alumno123')).toBe(true);
    expect(isValidUsername('user_name')).toBe(true);
    expect(isValidUsername('ABC')).toBe(true);
  });
  test('rechaza nombres con espacios', () => {
    expect(isValidUsername('nombre apellido')).toBe(false);
  });
  test('rechaza nombres con caracteres especiales', () => {
    expect(isValidUsername('user@name')).toBe(false);
    expect(isValidUsername('user-name')).toBe(false);
  });
  test('rechaza nombres demasiado cortos (menos de 3 caracteres)', () => {
    expect(isValidUsername('ab')).toBe(false);
  });
  test('rechaza nombres demasiado largos (más de 30 caracteres)', () => {
    expect(isValidUsername('a'.repeat(31))).toBe(false);
  });
});

describe('validateRegister', () => {
  test('devuelve array vacío con datos completamente válidos', () => {
    const errors = validateRegister({
      email: 'alumno@educa.madrid.org',
      username: 'alumno123',
      full_name: 'Alumno Prueba',
      password: 'contraseña123'
    });
    expect(errors).toHaveLength(0);
  });
  test('devuelve error si faltan campos obligatorios', () => {
    const errors = validateRegister({ email: '', username: '', full_name: '', password: '' });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors).toContain('Todos los campos son obligatorios.');
  });
  test('rechaza email con dominio incorrecto', () => {
    const errors = validateRegister({
      email: 'alumno@gmail.com',
      username: 'alumno123',
      full_name: 'Alumno Prueba',
      password: 'contraseña123'
    });
    expect(errors).toContain('Solo se permiten cuentas @educa.madrid.org.');
  });
  test('rechaza contraseña demasiado corta', () => {
    const errors = validateRegister({
      email: 'alumno@educa.madrid.org',
      username: 'alumno123',
      full_name: 'Alumno Prueba',
      password: 'corta'
    });
    expect(errors).toContain('La contraseña debe tener al menos 8 caracteres.');
  });
  test('rechaza username con formato inválido', () => {
    const errors = validateRegister({
      email: 'alumno@educa.madrid.org',
      username: 'nombre con espacios',
      full_name: 'Alumno Prueba',
      password: 'contraseña123'
    });
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('validateLogin', () => {
  test('devuelve array vacío con datos válidos', () => {
    const errors = validateLogin({ email: 'alumno@educa.madrid.org', password: 'cualquiercontraseña' });
    expect(errors).toHaveLength(0);
  });
  test('devuelve error si faltan campos', () => {
    const errors = validateLogin({ email: '', password: '' });
    expect(errors).toContain('Email y contraseña requeridos.');
  });
  test('rechaza dominio incorrecto', () => {
    const errors = validateLogin({ email: 'alumno@gmail.com', password: 'contraseña123' });
    expect(errors).toContain('Solo se permiten cuentas @educa.madrid.org.');
  });
});
