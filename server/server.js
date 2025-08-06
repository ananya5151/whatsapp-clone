// server/server.js
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(cors());
app.use(express.json({ extended: false })); // To accept JSON data in body

app.get('/', (req, res) => res.send('API Running'));

// Define Routes
app.use('/api', require('./routes/messages'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));