const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../db');

const router = express.Router();

// GET /api/admin/users - list all users with summary counts
router.get('/users', (req, res) => {
  const db = getDb();
  const users = db.prepare(`
    SELECT u.id, u.name, u.email, u.created_at,
      (SELECT COUNT(*) FROM appointments WHERE user_id = u.id AND cancelled = 0) as appointment_count,
      (SELECT COUNT(*) FROM prescriptions WHERE user_id = u.id AND active = 1) as prescription_count
    FROM users u
    ORDER BY u.name
  `).all();

  res.json(users);
});

// GET /api/admin/users/:id - get single user with full details
router.get('/users/:id', (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?').get(req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const appointments = db.prepare(
    'SELECT * FROM appointments WHERE user_id = ? ORDER BY datetime'
  ).all(req.params.id);

  const prescriptions = db.prepare(
    'SELECT * FROM prescriptions WHERE user_id = ? ORDER BY medication'
  ).all(req.params.id);

  res.json({ ...user, appointments, prescriptions });
});

// POST /api/admin/users - create new user
router.post('/users', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const db = getDb();

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'A user with this email already exists' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)').run(name, email, hash);

  const user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(user);
});

// PUT /api/admin/users/:id - update user
router.put('/users/:id', (req, res) => {
  const { name, email, password } = req.body;
  const db = getDb();

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (email && email !== user.email) {
    const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, req.params.id);
    if (existing) {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }
  }

  const updates = {
    name: name || user.name,
    email: email || user.email,
    password_hash: password ? bcrypt.hashSync(password, 10) : user.password_hash
  };

  db.prepare(`
    UPDATE users SET name = ?, email = ?, password_hash = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(updates.name, updates.email, updates.password_hash, req.params.id);

  const updated = db.prepare('SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// GET /api/admin/medications - list available medications
router.get('/medications', (req, res) => {
  const db = getDb();
  const meds = db.prepare('SELECT * FROM medications ORDER BY name').all();
  res.json(meds);
});

// GET /api/admin/dosages - list available dosages
router.get('/dosages', (req, res) => {
  const db = getDb();
  const dosages = db.prepare('SELECT * FROM dosages ORDER BY CAST(value AS INTEGER)').all();
  res.json(dosages);
});

// ============ APPOINTMENTS ============

// GET /api/admin/users/:userId/appointments
router.get('/users/:userId/appointments', (req, res) => {
  const db = getDb();
  const appointments = db.prepare(
    'SELECT * FROM appointments WHERE user_id = ? ORDER BY datetime'
  ).all(req.params.userId);
  res.json(appointments);
});

// POST /api/admin/users/:userId/appointments
router.post('/users/:userId/appointments', (req, res) => {
  const { provider, datetime, repeat } = req.body;

  if (!provider || !datetime) {
    return res.status(400).json({ error: 'Provider and datetime are required' });
  }

  const db = getDb();
  const result = db.prepare(
    'INSERT INTO appointments (user_id, provider, datetime, repeat) VALUES (?, ?, ?, ?)'
  ).run(req.params.userId, provider, datetime, repeat || 'none');

  const appt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(appt);
});

// PUT /api/admin/appointments/:id
router.put('/appointments/:id', (req, res) => {
  const { provider, datetime, repeat, end_date, cancelled } = req.body;
  const db = getDb();

  const appt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!appt) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  db.prepare(`
    UPDATE appointments
    SET provider = ?, datetime = ?, repeat = ?, end_date = ?, cancelled = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    provider ?? appt.provider,
    datetime ?? appt.datetime,
    repeat ?? appt.repeat,
    end_date !== undefined ? end_date : appt.end_date,
    cancelled !== undefined ? (cancelled ? 1 : 0) : appt.cancelled,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/admin/appointments/:id
router.delete('/appointments/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM appointments WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  res.json({ success: true });
});

// ============ PRESCRIPTIONS ============

// GET /api/admin/users/:userId/prescriptions
router.get('/users/:userId/prescriptions', (req, res) => {
  const db = getDb();
  const prescriptions = db.prepare(
    'SELECT * FROM prescriptions WHERE user_id = ? ORDER BY medication'
  ).all(req.params.userId);
  res.json(prescriptions);
});

// POST /api/admin/users/:userId/prescriptions
router.post('/users/:userId/prescriptions', (req, res) => {
  const { medication, dosage, quantity, refill_on, refill_schedule } = req.body;

  if (!medication || !dosage || !refill_on) {
    return res.status(400).json({ error: 'Medication, dosage, and refill date are required' });
  }

  const db = getDb();
  const result = db.prepare(
    'INSERT INTO prescriptions (user_id, medication, dosage, quantity, refill_on, refill_schedule) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.params.userId, medication, dosage, quantity || 1, refill_on, refill_schedule || 'monthly');

  const rx = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(rx);
});

// PUT /api/admin/prescriptions/:id
router.put('/prescriptions/:id', (req, res) => {
  const { medication, dosage, quantity, refill_on, refill_schedule, active } = req.body;
  const db = getDb();

  const rx = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(req.params.id);
  if (!rx) {
    return res.status(404).json({ error: 'Prescription not found' });
  }

  db.prepare(`
    UPDATE prescriptions
    SET medication = ?, dosage = ?, quantity = ?, refill_on = ?, refill_schedule = ?, active = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    medication ?? rx.medication,
    dosage ?? rx.dosage,
    quantity ?? rx.quantity,
    refill_on ?? rx.refill_on,
    refill_schedule ?? rx.refill_schedule,
    active !== undefined ? (active ? 1 : 0) : rx.active,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/admin/prescriptions/:id
router.delete('/prescriptions/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM prescriptions WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Prescription not found' });
  }
  res.json({ success: true });
});

module.exports = router;
