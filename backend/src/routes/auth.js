const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../db/connection');
const { verifyToken } = require('../middleware/auth');
const ValidationService = require('../services/ValidationService');

router.post('/register', async (req, res) => {
  const { email, username, full_name, password } = req.body;

  const errors = ValidationService.validateRegister({ email, username, full_name, password });
  if (errors.length > 0) return res.status(400).json({ error: errors[0] });

  try {
    const [existing] = await db.execute(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email.toLowerCase(), username]
    );
    if (existing.length > 0)
      return res.status(409).json({ error: 'El email o nombre de usuario ya existe.' });

    const [pending] = await db.execute(
      'SELECT id FROM registration_requests WHERE email = ?', [email.toLowerCase()]
    );
    if (pending.length > 0)
      return res.status(409).json({ error: 'Ya existe una solicitud pendiente con ese email.' });

    const hash = await bcrypt.hash(password, 10);
    await db.execute(
      'INSERT INTO registration_requests (email, full_name, username, password_hash) VALUES (?, ?, ?, ?)',
      [email.toLowerCase(), full_name, username, hash]
    );

    res.status(201).json({ message: 'Solicitud enviada. El administrador la revisará pronto.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al procesar el registro.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const errors = ValidationService.validateLogin({ email, password });
  if (errors.length > 0) return res.status(400).json({ error: errors[0] });

  try {
    const [rows] = await db.execute(
      'SELECT id, email, username, full_name, role, avatar, bio, is_active FROM users WHERE email = ?',
      [email.toLowerCase()]
    );
    if (rows.length === 0)
      return res.status(401).json({ error: 'Credenciales incorrectas.' });

    const user = rows[0];
    if (!user.is_active)
      return res.status(403).json({ error: 'Cuenta desactivada.' });

    const [pwRow] = await db.execute('SELECT password_hash FROM users WHERE id = ?', [user.id]);
    const valid = await bcrypt.compare(password, pwRow[0].password_hash);
    if (!valid)
      return res.status(401).json({ error: 'Credenciales incorrectas.' });

    await db.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ token, user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email || !ValidationService.isValidEmail(email))
    return res.status(400).json({ error: 'Email no válido.' });

  try {
    const [rows] = await db.execute('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (rows.length === 0)
      return res.json({ message: 'Si el email existe, recibirás un PIN.' });

    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000);
    await db.execute(
      'INSERT INTO password_resets (user_id, pin, expires_at) VALUES (?, ?, ?)',
      [rows[0].id, pin, expires]
    );

    // TODO: enviar por email con nodemailer
    console.log(`PIN para ${email}: ${pin}`);

    res.json({ message: 'Si el email existe, recibirás un PIN.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al procesar la solicitud.' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { email, pin, new_password } = req.body;
  if (!email || !pin || !new_password)
    return res.status(400).json({ error: 'Faltan campos.' });
  if (!ValidationService.isValidPassword(new_password))
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });

  try {
    const [users] = await db.execute('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (users.length === 0) return res.status(400).json({ error: 'Datos incorrectos.' });

    const userId = users[0].id;
    const [resets] = await db.execute(
      'SELECT id FROM password_resets WHERE user_id = ? AND pin = ? AND expires_at > NOW() AND used = FALSE ORDER BY created_at DESC LIMIT 1',
      [userId, pin]
    );
    if (resets.length === 0) return res.status(400).json({ error: 'PIN inválido o expirado.' });

    const hash = await bcrypt.hash(new_password, 10);

    // atomic: update password and mark pin as used
    const conn = await db.getConnection();
    await conn.beginTransaction();
    try {
      await conn.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hash, userId]);
      await conn.execute('UPDATE password_resets SET used = TRUE WHERE id = ?', [resets[0].id]);
      await conn.commit();
    } catch (txErr) {
      await conn.rollback();
      throw txErr;
    } finally {
      conn.release();
    }

    res.json({ message: 'Contraseña actualizada.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al resetear contraseña.' });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, email, username, full_name, role, avatar, bio, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Error.' });
  }
});

module.exports = router;
