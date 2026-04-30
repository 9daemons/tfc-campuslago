const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, type, message, reference_id, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
      [req.user.id]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Error.' });
  }
});

router.put('/read-all', verifyToken, async (req, res) => {
  try {
    await db.execute('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Notificaciones marcadas como leídas.' });
  } catch (e) {
    res.status(500).json({ error: 'Error.' });
  }
});

module.exports = router;
