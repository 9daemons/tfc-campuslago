const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/users/:username
router.get('/:username', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, email, username, full_name, role, avatar, bio, created_at FROM users WHERE username = ?',
      [req.params.username]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });

    const user = rows[0];
    const [followersR] = await db.execute('SELECT COUNT(*) AS c FROM follows WHERE following_id = ?', [user.id]);
    const [followingR] = await db.execute('SELECT COUNT(*) AS c FROM follows WHERE follower_id = ?', [user.id]);
    const [isFollowR] = await db.execute(
      'SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?',
      [req.user.id, user.id]
    );

    res.json({
      ...user,
      followers: followersR[0].c,
      following: followingR[0].c,
      is_following: isFollowR.length > 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Error.' });
  }
});

// GET /api/users/:username/posts
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
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `, [userRows[0].id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error.' });
  }
});

// PUT /api/users/me/profile
router.put('/me/profile', verifyToken, upload.single('avatar'), async (req, res) => {
  const { full_name, bio } = req.body;
  const avatar = req.file ? `/uploads/${req.file.filename}` : undefined;

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
  } catch (err) {
    res.status(500).json({ error: 'Error.' });
  }
});

// POST /api/users/:id/follow
router.post('/:id/follow', verifyToken, async (req, res) => {
  if (req.params.id == req.user.id) {
    return res.status(400).json({ error: 'No puedes seguirte a ti mismo.' });
  }
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
  } catch (err) {
    res.status(500).json({ error: 'Error.' });
  }
});

// Admin: GET /api/users/admin/requests
router.get('/admin/requests', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, email, full_name, username, status, created_at FROM registration_requests ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error.' });
  }
});

// Admin: POST /api/users/admin/requests/:id/approve
router.post('/admin/requests/:id/approve', verifyToken, requireRole('admin'), async (req, res) => {
  const { role } = req.body;
  try {
    const [reqs] = await db.execute('SELECT * FROM registration_requests WHERE id = ?', [req.params.id]);
    if (reqs.length === 0) return res.status(404).json({ error: 'Solicitud no encontrada.' });

    const r = reqs[0];
    const userRole = ['student', 'teacher', 'admin'].includes(role) ? role : 'student';

    await db.execute(
      'INSERT INTO users (email, username, full_name, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [r.email, r.username, r.full_name, r.password_hash, userRole]
    );
    await db.execute('UPDATE registration_requests SET status = ? WHERE id = ?', ['approved', req.params.id]);
    res.json({ message: 'Solicitud aprobada, usuario creado.' });
  } catch (err) {
    res.status(500).json({ error: 'Error.' });
  }
});

// Admin: POST /api/users/admin/requests/:id/reject
router.post('/admin/requests/:id/reject', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    await db.execute('UPDATE registration_requests SET status = ? WHERE id = ?', ['rejected', req.params.id]);
    res.json({ message: 'Solicitud rechazada.' });
  } catch (err) {
    res.status(500).json({ error: 'Error.' });
  }
});

module.exports = router;
