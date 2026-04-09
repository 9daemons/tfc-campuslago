const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { verifyToken } = require('../middleware/auth');

// GET /api/messages/conversations
router.get('/conversations', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT c.id, c.is_group, c.name,
        (SELECT m.content FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
        (SELECT m.created_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message_at,
        (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) AS message_count
      FROM conversations c
      JOIN conversation_members cm ON cm.conversation_id = c.id
      WHERE cm.user_id = ?
      ORDER BY last_message_at DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error.' });
  }
});

// GET /api/messages/conversations/:id
router.get('/conversations/:id', verifyToken, async (req, res) => {
  try {
    const [member] = await db.execute(
      'SELECT 1 FROM conversation_members WHERE conversation_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (member.length === 0) return res.status(403).json({ error: 'Sin acceso.' });

    const [messages] = await db.execute(`
      SELECT m.id, m.content, m.created_at, u.username, u.avatar, u.full_name, m.sender_id
      FROM messages m JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
      LIMIT 100
    `, [req.params.id]);

    const [members] = await db.execute(`
      SELECT u.id, u.username, u.avatar, u.full_name
      FROM conversation_members cm JOIN users u ON cm.user_id = u.id
      WHERE cm.conversation_id = ?
    `, [req.params.id]);

    res.json({ messages, members });
  } catch (err) {
    res.status(500).json({ error: 'Error.' });
  }
});

// POST /api/messages/conversations - crear DM o grupo
router.post('/conversations', verifyToken, async (req, res) => {
  const { user_ids, name, is_group } = req.body;
  if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
    return res.status(400).json({ error: 'Se requieren destinatarios.' });
  }

  try {
    const allMembers = [...new Set([req.user.id, ...user_ids.map(Number)])];

    // Para DM (2 personas) comprobar si ya existe
    if (!is_group && allMembers.length === 2) {
      const [existing] = await db.execute(`
        SELECT c.id FROM conversations c
        JOIN conversation_members cm1 ON cm1.conversation_id = c.id AND cm1.user_id = ?
        JOIN conversation_members cm2 ON cm2.conversation_id = c.id AND cm2.user_id = ?
        WHERE c.is_group = FALSE
        LIMIT 1
      `, [allMembers[0], allMembers[1]]);
      if (existing.length > 0) return res.json({ id: existing[0].id, existing: true });
    }

    const conn = await db.getConnection();
    await conn.beginTransaction();
    try {
      const [conv] = await conn.execute(
        'INSERT INTO conversations (is_group, name, created_by) VALUES (?, ?, ?)',
        [is_group ? 1 : 0, name || null, req.user.id]
      );
      const convId = conv.insertId;
      for (const uid of allMembers) {
        await conn.execute('INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)', [convId, uid]);
      }
      await conn.commit();
      conn.release();
      res.status(201).json({ id: convId });
    } catch (txErr) {
      await conn.rollback();
      conn.release();
      throw txErr;
    }
  } catch (err) {
    res.status(500).json({ error: 'Error.' });
  }
});

// POST /api/messages/conversations/:id/messages
router.post('/conversations/:id/messages', verifyToken, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Mensaje vacío.' });

  try {
    const [member] = await db.execute(
      'SELECT 1 FROM conversation_members WHERE conversation_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (member.length === 0) return res.status(403).json({ error: 'Sin acceso.' });

    const [result] = await db.execute(
      'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
      [req.params.id, req.user.id, content]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Error.' });
  }
});

module.exports = router;
