const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q || q.length < 2) return res.json({ users: [], posts: [] });

  const like = `%${q}%`;
  try {
    const [users] = await db.execute(
      "SELECT id, username, full_name, avatar, role FROM users WHERE (username LIKE ? OR full_name LIKE ?) AND role != 'admin' LIMIT 10",
      [like, like]
    );
    const [posts] = await db.execute(`
      SELECT p.id, p.content, p.created_at, u.username, u.avatar
      FROM posts p JOIN users u ON p.user_id = u.id
      WHERE p.content LIKE ? AND p.is_anonymous = FALSE
      ORDER BY p.created_at DESC LIMIT 10
    `, [like]);
    res.json({ users, posts });
  } catch (e) {
    res.status(500).json({ error: 'Error.' });
  }
});

module.exports = router;
