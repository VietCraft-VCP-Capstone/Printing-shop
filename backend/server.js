const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 8880;

app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.VIETCRAFT_BE_URL,
  'http://localhost:3001',
  'http://localhost:3000',
  'http://localhost:8080'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy: Origin not allowed.'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Serve blank product images (ảnh phôi trơn do xưởng in quản lý).
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize Database connection & seed
connectDB();

// Bind Modular API routes
app.use('/api', apiRoutes);

// Default status & health check routes
app.get(['/', '/health'], (req, res) => {
  res.json({ service: 'printing-shop-backend', port: PORT, status: 'online', timestamp: new Date() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Printing Shop Backend is running on port ${PORT}`);
});
