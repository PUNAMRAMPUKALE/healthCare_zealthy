const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const portalRoutes = require('./routes/portal');
const { getDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
const corsOptions = process.env.NODE_ENV === 'production'
  ? { origin: true, credentials: true }
  : { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true };
app.use(cors(corsOptions));
app.use(express.json());

// Initialize DB
getDb();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/portal', portalRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
const clientDist = path.join(__dirname, '..', 'Client', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🏥 Zealthy EMR server running on port ${PORT}`);
});

module.exports = app;
