// Import required packages
const express = require('express');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;
const UserRouter = require('./routes/user.routes');
const connectDB = require('./config/db');
const AdminRouter = require('./routes/admin.routes');
const cors = require('cors');

cors({
  origin: '*',
});
// Load environment variables from .env file
dotenv.config();
connectDB()

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Default route
app.get('/', (req, res) => {
  res.send('Hello world');
});

// User-related routes (including upload/register)
app.use('/api/users', UserRouter);
app.use('/api/admin', AdminRouter);    

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});