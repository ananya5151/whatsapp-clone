// server/server.js
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const connectDB = require('./config/db');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Your latest live Vercel frontend URL from the error log
const clientURL = "https://whatsapp-clone-fiqg4p7fw-ananya-vermas-projects-980a5723.vercel.app";

// Initialize Socket.IO and configure CORS for it
const io = new Server(server, {
  cors: {
    origin: [clientURL, "http://localhost:3000"], // Allow Vercel and local dev
    methods: ["GET", "POST"]
  }
});

// Connect to Database
connectDB();

// Init Middleware
app.use(cors({ origin: [clientURL, "http://localhost:3000"] })); // Allow Express requests
app.use(express.json());

// Make the io instance available to your routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.get('/', (req, res) => res.send('Backend API is running...'));

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