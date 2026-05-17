const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// Listar todos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM clients WHERE user_id = ? ORDER BY name',
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar
router.post('/', async (req, res) => {
  const { id, name, phone, cep, address, city, state } = req.body;
  if (!id || !name) return res.status(400).json({ error: 'Campos obrigatórios' });

  try {
    await pool.query(
      'INSERT INTO clients (id, user_id, name, phone, cep, address, city, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, req.userId, name, phone, cep, address, city, state]
    );
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar
router.put('/:id', async (req, res) => {
  const { name, phone, cep, address, city, state } = req.body;
  try {
    await pool.query(
      'UPDATE clients SET name=?, phone=?, cep=?, address=?, city=?, state=? WHERE id=? AND user_id=?',
      [name, phone, cep, address, city, state, req.params.id, req.userId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deletar
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM clients WHERE id=? AND user_id=?', [req.params.id, req.userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;