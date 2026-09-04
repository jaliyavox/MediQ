require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());

// Health check - use this to confirm the API is up before debugging anything else.
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/clinics', require('./routes/clinics'));
app.use('/api/pharmacies', require('./routes/pharmacies'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/stock', require('./routes/stock'));
app.use('/api/tokens', require('./routes/tokens'));

// Doctor portal (Member A)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/leads', require('./routes/leads'));

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Central error handler so a thrown error never crashes the server mid-demo.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
