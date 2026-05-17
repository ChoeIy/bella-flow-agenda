const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM appointments WHERE user_id = ? ORDER BY date, time',
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { id, clientId, serviceId, date, time, status, paid } = req.body;
  if (!id || !clientId || !serviceId || !date || !time) return res.status(400).json({ error: 'Campos obrigatórios' });
  try {
    await pool.query(
      'INSERT INTO appointments (id, user_id, client_id, service_id, date, time, status, paid) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, req.userId, clientId, serviceId, date, time, status || 'agendado', paid || false]
    );
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { clientId, serviceId, date, time, status, paid } = req.body;
  try {
    await pool.query(
      'UPDATE appointments SET client_id=?, service_id=?, date=?, time=?, status=?, paid=? WHERE id=? AND user_id=?',
      [clientId, serviceId, date, time, status, paid, req.params.id, req.userId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM appointments WHERE id=? AND user_id=?', [req.params.id, req.userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;