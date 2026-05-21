const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/admin/fix-anon', verifyToken, requireRole('admin'), async (req, res) => {
  const [result] = await db.execute("UPDATE posts SET is_anonymous = 0 WHERE post_type = 'official'");
  res.json({ updated: result.affectedRows });
});

router.get('/me/suggested', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT id, username, full_name, avatar, role
      FROM users
      WHERE id != ?
        AND is_active = TRUE
        AND role != 'admin'
        AND id NOT IN (SELECT following_id FROM follows WHERE follower_id = ?)
      ORDER BY RAND()
      LIMIT 8
    `, [req.user.id, req.user.id]);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Error.' });
  }
});

router.get('/:username', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, email, username, full_name, role, avatar, bio, created_at FROM users WHERE username = ?',
      [req.params.username]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });
    if (rows[0].role === 'admin' && req.user.role !== 'admin')
      return res.status(404).json({ error: 'Usuario no encontrado.' });

    const user = rows[0];
    const [[{ c: followers }]] = await db.execute('SELECT COUNT(*) AS c FROM follows WHERE following_id = ?', [user.id]);
    const [[{ c: following }]] = await db.execute('SELECT COUNT(*) AS c FROM follows WHERE follower_id = ?', [user.id]);
    const [isFollowing] = await db.execute(
      'SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?',
      [req.user.id, user.id]
    );

    res.json({ ...user, followers, following, is_following: isFollowing.length > 0 });
  } catch (e) {
    res.status(500).json({ error: 'Error.' });
  }
});

router.get('/:username/posts', verifyToken, async (req, res) => {
  try {
    const [userRows] = await db.execute('SELECT id FROM users WHERE username = ?', [req.params.username]);
    if (userRows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });

    const [rows] = await db.execute(`
      SELECT p.id, p.content, p.image_url, p.post_type, p.created_at,
        COUNT(DISTINCT l.user_id) AS likes_count,
        COUNT(DISTINCT c.id) AS comments_count
      FROM posts p
      LEFT JOIN likes l ON l.post_id = p.id
      LEFT JOIN comments c ON c.post_id = p.id
      WHERE p.user_id = ?
      GROUP BY p.id ORDER BY p.created_at DESC
    `, [userRows[0].id]);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Error.' });
  }
});

router.put('/me/profile', verifyToken, upload.single('avatar'), async (req, res) => {
  const { full_name, bio } = req.body;
  const avatar = req.file ? req.file.path : undefined;

  try {
    const updates = [];
    const values = [];
    if (full_name !== undefined) { updates.push('full_name = ?'); values.push(full_name); }
    if (bio !== undefined) { updates.push('bio = ?'); values.push(bio); }
    if (avatar) { updates.push('avatar = ?'); values.push(avatar); }

    if (updates.length === 0) return res.status(400).json({ error: 'Nada que actualizar.' });

    values.push(req.user.id);
    await db.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ message: 'Perfil actualizado.' });
  } catch (e) {
    res.status(500).json({ error: 'Error.' });
  }
});

router.post('/:id/follow', verifyToken, async (req, res) => {
  if (req.params.id == req.user.id)
    return res.status(400).json({ error: 'No puedes seguirte a ti mismo.' });
  const [target] = await db.execute('SELECT role FROM users WHERE id = ?', [req.params.id]);
  if (target.length && target[0].role === 'admin')
    return res.status(400).json({ error: 'No puedes seguir esta cuenta.' });
  try {
    const [existing] = await db.execute(
      'SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?',
      [req.user.id, req.params.id]
    );
    if (existing.length > 0) {
      await db.execute('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [req.user.id, req.params.id]);
      return res.json({ following: false });
    }
    await db.execute('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)', [req.user.id, req.params.id]);
    res.json({ following: true });
  } catch (e) {
    res.status(500).json({ error: 'Error.' });
  }
});

router.get('/admin/requests', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, email, full_name, username, status, created_at FROM registration_requests ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Error.' });
  }
});

router.post('/admin/requests/:id/approve', verifyToken, requireRole('admin'), async (req, res) => {
  const { role } = req.body;
  try {
    const [reqs] = await db.execute('SELECT * FROM registration_requests WHERE id = ?', [req.params.id]);
    if (reqs.length === 0) return res.status(404).json({ error: 'Solicitud no encontrada.' });

    const r = reqs[0];
    const userRole = ['student', 'teacher', 'admin'].includes(role) ? role : 'student';

    // transacción: crear usuario y marcar solicitud como aprobada
    const conn = await db.getConnection();
    await conn.beginTransaction();
    try {
      await conn.execute(
        'INSERT INTO users (email, username, full_name, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        [r.email, r.username, r.full_name, r.password_hash, userRole]
      );
      await conn.execute('UPDATE registration_requests SET status = ? WHERE id = ?', ['approved', req.params.id]);
      await conn.commit();
      conn.release();
      res.json({ message: 'Solicitud aprobada, usuario creado.' });
    } catch (txErr) {
      await conn.rollback();
      conn.release();
      throw txErr;
    }
  } catch (e) {
    res.status(500).json({ error: 'Error.' });
  }
});

router.post('/admin/requests/:id/reject', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    await db.execute('UPDATE registration_requests SET status = ? WHERE id = ?', ['rejected', req.params.id]);
    res.json({ message: 'Solicitud rechazada.' });
  } catch (e) {
    res.status(500).json({ error: 'Error.' });
  }
});

module.exports = router;
