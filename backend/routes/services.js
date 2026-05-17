const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM services WHERE user_id = ? ORDER BY name', [req.userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { id, name, price } = req.body;
  if (!id || !name || price === undefined) return res.status(400).json({ error: 'Campos obrigatórios' });
  try {
    await pool.query('INSERT INTO services (id, user_id, name, price) VALUES (?, ?, ?, ?)', [id, req.userId, name, price]);
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { name, price } = req.body;
  try {
    await pool.query('UPDATE services SET name=?, price=? WHERE id=? AND user_id=?', [name, price, req.params.id, req.userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM services WHERE id=? AND user_id=?', [req.params.id, req.userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;