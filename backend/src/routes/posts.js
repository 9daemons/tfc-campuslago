const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/feed/official', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT p.id, p.content, p.image_url, p.is_anonymous, p.created_at,
        IF(p.is_anonymous, NULL, u.username) AS username,
        IF(p.is_anonymous, NULL, u.avatar) AS avatar,
        IF(p.is_anonymous, NULL, u.full_name) AS full_name,
        COUNT(DISTINCT l.user_id) AS likes_count,
        COUNT(DISTINCT c.id) AS comments_count,
        EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) AS liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON l.post_id = p.id
      LEFT JOIN comments c ON c.post_id = p.id
      WHERE p.post_type = 'official'
      GROUP BY p.id
      ORDER BY p.created_at DESC LIMIT 50
    `, [req.user.id]);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al obtener noticias.' });
  }
});

router.get('/feed/student', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT p.id, p.content, p.image_url, p.created_at,
        u.username, u.avatar, u.full_name, u.id AS user_id, u.role,
        COUNT(DISTINCT l.user_id) AS likes_count,
        COUNT(DISTINCT c.id) AS comments_count,
        EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) AS liked,
        EXISTS(SELECT 1 FROM saved_posts WHERE post_id = p.id AND user_id = ?) AS saved
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON l.post_id = p.id
      LEFT JOIN comments c ON c.post_id = p.id
      WHERE p.post_type = 'student'
      GROUP BY p.id
      ORDER BY p.created_at DESC LIMIT 50
    `, [req.user.id, req.user.id]);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al obtener posts.' });
  }
});

router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  const { content } = req.body;
  const image_url = req.file ? req.file.path : null;

  if (!content && !image_url)
    return res.status(400).json({ error: 'El post necesita contenido o imagen.' });

  try {
    // el admin siempre publica como noticia oficial
    const type = req.user.role === 'admin' ? 'official' : 'student';
    const anon = req.user.role === 'admin' ? 1 : 0;

    const [result] = await db.execute(
      'INSERT INTO posts (user_id, content, image_url, post_type, is_anonymous) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, content || null, image_url, type, anon]
    );
    res.status(201).json({ id: result.insertId, message: 'Post creado.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al crear post.' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT user_id FROM posts WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Post no encontrado.' });
    if (rows[0].user_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Sin permisos.' });

    await db.execute('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Post eliminado.' });
  } catch (e) {
    res.status(500).json({ error: 'Error al eliminar.' });
  }
});

router.post('/:id/like', verifyToken, async (req, res) => {
  try {
    const [existing] = await db.execute(
      'SELECT 1 FROM likes WHERE user_id = ? AND post_id = ?',
      [req.user.id, req.params.id]
    );
    if (existing.length > 0) {
      await db.execute('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [req.user.id, req.params.id]);
      return res.json({ liked: false });
    }
    await db.execute('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [req.user.id, req.params.id]);
    res.json({ liked: true });
  } catch (e) {
    res.status(500).json({ error: 'Error.' });
  }
});

router.post('/:id/save', verifyToken, async (req, res) => {
  try {
    const [existing] = await db.execute(
      'SELECT 1 FROM saved_posts WHERE user_id = ? AND post_id = ?',
      [req.user.id, req.params.id]
    );
    if (existing.length > 0) {
      await db.execute('DELETE FROM saved_posts WHERE user_id = ? AND post_id = ?', [req.user.id, req.params.id]);
      return res.json({ saved: false });
    }
    await db.execute('INSERT INTO saved_posts (user_id, post_id) VALUES (?, ?)', [req.user.id, req.params.id]);
    res.json({ saved: true });
  } catch (e) {
    res.status(500).json({ error: 'Error.' });
  }
});

router.get('/:id/comments', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT c.id, c.content, c.created_at, u.username, u.avatar, u.full_name
      FROM comments c JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ? ORDER BY c.created_at ASC
    `, [req.params.id]);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Error.' });
  }
});

router.post('/:id/comments', verifyToken, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Comentario vacío.' });
  try {
    const [result] = await db.execute(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [req.params.id, req.user.id, content]
    );
    res.status(201).json({ id: result.insertId, message: 'Comentario añadido.' });
  } catch (e) {
    res.status(500).json({ error: 'Error.' });
  }
});

module.exports = router;
