const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Import routes
const authRoutes = require('./routes/auth');
const radioRoutes = require('./routes/radio');
const adminRoutes = require('./routes/admin');
const azuracastRoutes = require('./routes/azuracast');
const zenofmRoutes = require('./routes/zenofm');

// Middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

// MongoDB connection
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/radio-pwa';
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Initialize database connection
connectDB();

// Socket.io for real-time updates
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('join-radio', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${room}`);
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Make io available in routes
app.set('io', io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/radio', radioRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/azuracast', azuracastRoutes);
app.use('/api/zenofm', zenofmRoutes);

// Generic API endpoints for MongoDB operations
app.use('/api/mongodb', require('./routes/mongodb'));

// Analytics endpoint
app.post('/api/analytics', (req, res) => {
    // Store analytics data
    console.log('Analytics data received:', req.body);
    res.json({ success: true });
});

// Push notification subscription
app.post('/api/push/subscribe', (req, res) => {
    // Store push subscription
    console.log('Push subscription received:', req.body);
    res.json({ success: true });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Serve PWA files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/manifest.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'manifest.json'));
});

app.get('/sw.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'sw.js'));
});

app.get('/offline.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'offline.html'));
});

// Catch-all handler for PWA routes
app.get('*', (req, res) => {
    // Serve static files if they exist
    if (req.path.includes('.')) {
        res.status(404).send('File not found');
        return;
    }
    
    // Otherwise serve the PWA
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start background services
require('./services/scheduler');
require('./services/streamMonitor');

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Radio PWA server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;