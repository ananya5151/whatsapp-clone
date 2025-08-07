// server/config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  // Log that we are attempting to connect
  console.log('Attempting to connect to MongoDB...');

  // Security: Don't log the full URI in production. We'll just check if it exists.
  if (!process.env.MONGO_URI) {
    console.error('FATAL ERROR: MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connection Successful!');
  } catch (err) {
    // Log the specific error if the connection fails
    console.error('❌ MongoDB Connection Failed:', err.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;