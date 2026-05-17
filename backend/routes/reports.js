const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/billing', async (req, res) => {
  const { start, end, paid, serviceIds } = req.query;
  let query = `
    SELECT s.name as service_name, SUM(s.price) as total
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    WHERE a.user_id = ? AND a.status = 'agendado'
  `;
  const params = [req.userId];

  if (start && end) {
    query += ' AND a.date BETWEEN ? AND ?';
    params.push(start, end);
  }
  if (paid === 'true') {
    query += ' AND a.paid = true';
  }
  if (serviceIds) {
    const ids = serviceIds.split(',');
    query += ` AND a.service_id IN (${ids.map(() => '?').join(',')})`;
    params.push(...ids);
  }

  query += ' GROUP BY s.name';
  
  try {
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/appointments', async (req, res) => {
  const { start, end, serviceIds } = req.query;
  let query = `
    SELECT a.*, c.name as client_name, s.name as service_name, s.price
    FROM appointments a
    JOIN clients c ON a.client_id = c.id
    JOIN services s ON a.service_id = s.id
    WHERE a.user_id = ? AND a.status = 'agendado'
  `;
  const params = [req.userId];

  if (start && end) {
    query += ' AND a.date BETWEEN ? AND ?';
    params.push(start, end);
  }
  if (serviceIds) {
    const ids = serviceIds.split(',');
    query += ` AND a.service_id IN (${ids.map(() => '?').join(',')})`;
    params.push(...ids);
  }

  query += ' ORDER BY a.date, a.time';

  try {
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;