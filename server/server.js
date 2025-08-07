// server/server.js
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const connectDB = require('./config/db');
const cors = require('cors');

const app = express();
const server = http.createServer(app); // Create an HTTP server from the Express app

// Initialize Socket.IO and configure CORS for it
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow your React app's origin
    methods: ["GET", "POST"]
  }
});

// Connect to Database
connectDB();

// Init Middleware
app.use(cors());
app.use(express.json()); // Simplified JSON middleware

// Make the `io` instance available to your routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.get('/', (req, res) => res.send('API Running with WebSocket Support'));

// Define Routes
app.use('/api', require('./routes/messages'));

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('🔌 A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log(' disconnecting user:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));