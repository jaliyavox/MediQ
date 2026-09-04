// LOCKED FILE - the Express app itself. server.js connects to MongoDB and
// starts it. Kept separate so the routes can be smoke-tested without a database.
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

const normalizeOrigin = (value) => value?.trim().replace(/\/+$/, '');
const allowedOrigins = new Set([
  'http://localhost:5173',
  normalizeOrigin(process.env.FRONTEND_URL),
].filter(Boolean));

app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || allowedOrigins.has(normalizeOrigin(origin)));
  },
}));
app.use(express.json());

// Health check - use this to confirm the API is up before debugging anything else.
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/providers', require('./routes/providers'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Central error handler so a thrown error never crashes the server mid-demo.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

module.exports = app;
