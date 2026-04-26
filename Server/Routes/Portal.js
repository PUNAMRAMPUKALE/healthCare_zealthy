const express = require('express');
const { getDb } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/portal/me - get current user info
router.get('/me', (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});

// GET /api/portal/summary - dashboard summary (next 7 days)
router.get('/summary', (req, res) => {
  const db = getDb();

  const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Get all appointments (we compute upcoming occurrences on the client)
  const appointments = db.prepare(`
    SELECT * FROM appointments
    WHERE user_id = ? AND cancelled = 0
    ORDER BY datetime
  `).all(req.user.id);

  // Get all active prescriptions
  const prescriptions = db.prepare(`
    SELECT * FROM prescriptions
    WHERE user_id = ? AND active = 1
    ORDER BY refill_on
  `).all(req.user.id);

  res.json({ user, appointments, prescriptions });
});

// GET /api/portal/appointments - all appointments
router.get('/appointments', (req, res) => {
  const db = getDb();
  const appointments = db.prepare(`
    SELECT * FROM appointments
    WHERE user_id = ? AND cancelled = 0
    ORDER BY datetime
  `).all(req.user.id);

  res.json(appointments);
});

// GET /api/portal/prescriptions - all prescriptions
router.get('/prescriptions', (req, res) => {
  const db = getDb();
  const prescriptions = db.prepare(`
    SELECT * FROM prescriptions
    WHERE user_id = ? AND active = 1
    ORDER BY medication
  `).all(req.user.id);

  res.json(prescriptions);
});

module.exports = router;
