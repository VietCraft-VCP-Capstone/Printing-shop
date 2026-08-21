const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 8880;

// Enable CORS and parsing of JSON payloads
app.use(cors());
app.use(express.json());

// Initialize Database connection & seed
connectDB();

// Bind Modular API routes
app.use('/api', apiRoutes);

// Default status route
app.get('/', (req, res) => {
  res.json({ service: 'printing-shop-backend', port: PORT, status: 'online' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Printing Shop Backend is running on port ${PORT}`);
});
