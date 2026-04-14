const ValidationService = require('../src/services/ValidationService');

describe('isValidEmail', () => {
  test('acepta emails @educa.madrid.org', () => {
    expect(ValidationService.isValidEmail('alumno@educa.madrid.org')).toBe(true);
  });
  test('acepta emails de admin del dominio correcto', () => {
    expect(ValidationService.isValidEmail('admin@educa.madrid.org')).toBe(true);
  });
  test('rechaza emails de otros dominios', () => {
    expect(ValidationService.isValidEmail('alumno@gmail.com')).toBe(false);
    expect(ValidationService.isValidEmail('alumno@hotmail.com')).toBe(false);
  });
  test('rechaza valores no string', () => {
    expect(ValidationService.isValidEmail(null)).toBe(false);
    expect(ValidationService.isValidEmail(undefined)).toBe(false);
    expect(ValidationService.isValidEmail(123)).toBe(false);
  });
  test('rechaza string vacío', () => {
    expect(ValidationService.isValidEmail('')).toBe(false);
  });
});

describe('isValidPassword', () => {
  test('acepta contraseñas de exactamente 8 caracteres', () => {
    expect(ValidationService.isValidPassword('12345678')).toBe(true);
  });
  test('acepta contraseñas largas', () => {
    expect(ValidationService.isValidPassword('contraseñaSegura123!')).toBe(true);
  });
  test('rechaza contraseñas de menos de 8 caracteres', () => {
    expect(ValidationService.isValidPassword('corto')).toBe(false);
    expect(ValidationService.isValidPassword('1234567')).toBe(false);
  });
  test('rechaza string vacío', () => {
    expect(ValidationService.isValidPassword('')).toBe(false);
  });
});

describe('isValidUsername', () => {
  test('acepta nombres alfanuméricos válidos', () => {
    expect(ValidationService.isValidUsername('alumno123')).toBe(true);
    expect(ValidationService.isValidUsername('user_name')).toBe(true);
  });
  test('rechaza nombres con espacios', () => {
    expect(ValidationService.isValidUsername('nombre apellido')).toBe(false);
  });
  test('rechaza nombres con caracteres especiales', () => {
    expect(ValidationService.isValidUsername('user@name')).toBe(false);
  });
  test('rechaza nombres demasiado cortos', () => {
    expect(ValidationService.isValidUsername('ab')).toBe(false);
  });
  test('rechaza nombres demasiado largos', () => {
    expect(ValidationService.isValidUsername('a'.repeat(31))).toBe(false);
  });
});

describe('validateRegister', () => {
  test('devuelve array vacío con datos válidos', () => {
    const errors = ValidationService.validateRegister({
      email: 'alumno@educa.madrid.org',
      username: 'alumno123',
      full_name: 'Alumno Prueba',
      password: 'contraseña123'
    });
    expect(errors).toHaveLength(0);
  });
  test('devuelve error si faltan campos', () => {
    const errors = ValidationService.validateRegister({ email: '', username: '', full_name: '', password: '' });
    expect(errors).toContain('Todos los campos son obligatorios.');
  });
  test('rechaza email con dominio incorrecto', () => {
    const errors = ValidationService.validateRegister({
      email: 'alumno@gmail.com',
      username: 'alumno123',
      full_name: 'Alumno Prueba',
      password: 'contraseña123'
    });
    expect(errors).toContain('Solo se permiten cuentas @educa.madrid.org.');
  });
  test('rechaza contraseña corta', () => {
    const errors = ValidationService.validateRegister({
      email: 'alumno@educa.madrid.org',
      username: 'alumno123',
      full_name: 'Alumno Prueba',
      password: 'corta'
    });
    expect(errors).toContain('La contraseña debe tener al menos 8 caracteres.');
  });
  test('rechaza username inválido', () => {
    const errors = ValidationService.validateRegister({
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
    const errors = ValidationService.validateLogin({ email: 'alumno@educa.madrid.org', password: 'cualquiercontraseña' });
    expect(errors).toHaveLength(0);
  });
  test('error si faltan campos', () => {
    const errors = ValidationService.validateLogin({ email: '', password: '' });
    expect(errors).toContain('Email y contraseña requeridos.');
  });
  test('rechaza dominio incorrecto', () => {
    const errors = ValidationService.validateLogin({ email: 'alumno@gmail.com', password: 'contraseña123' });
    expect(errors).toContain('Solo se permiten cuentas @educa.madrid.org.');
  });
});
