const express = require('express');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

// Get admin dashboard data
router.get('/data', adminAuth, (req, res) => {
    // Mock admin data
    res.json({
        success: true,
        data: {
            overview: {
                totalUsers: 1250,
                activeStreams: 3,
                totalShows: 24,
                storageUsed: '2.4 GB'
            },
            streams: [
                {
                    id: 1,
                    name: 'Main Stream',
                    url: 'https://stream.example.com/main',
                    status: 'online',
                    listeners: 450,
                    bitrate: '128 kbps'
                },
                {
                    id: 2,
                    name: 'Secondary Stream',
                    url: 'https://stream.example.com/secondary',
                    status: 'online',
                    listeners: 120,
                    bitrate: '64 kbps'
                }
            ],
            users: [
                {
                    id: 1,
                    username: 'admin',
                    name: 'Administrator',
                    role: 'admin',
                    lastLogin: new Date().toISOString(),
                    status: 'active'
                },
                {
                    id: 2,
                    username: 'dj1',
                    name: 'DJ Morning',
                    role: 'dj',
                    lastLogin: new Date(Date.now() - 86400000).toISOString(),
                    status: 'active'
                }
            ],
            shows: [
                {
                    id: 1,
                    title: 'Morning Show',
                    host: 'DJ Morning',
                    schedule: 'Mon-Fri 06:00-09:00',
                    status: 'active'
                },
                {
                    id: 2,
                    title: 'Evening Drive',
                    host: 'DJ Evening',
                    schedule: 'Mon-Fri 18:00-20:00',
                    status: 'active'
                }
            ]
        }
    });
});

// Manage streaming
router.post('/stream/toggle', adminAuth, (req, res) => {
    const { streamId, action } = req.body;
    
    res.json({
        success: true,
        message: `Stream ${action === 'start' ? 'iniciado' : 'detenido'} exitosamente`,
        data: {
            streamId,
            status: action === 'start' ? 'online' : 'offline',
            timestamp: new Date().toISOString()
        }
    });
});

// Add new show
router.post('/shows', adminAuth, (req, res) => {
    const { title, host, schedule, description } = req.body;
    
    // Mock response
    res.json({
        success: true,
        message: 'Programa agregado exitosamente',
        data: {
            id: Math.floor(Math.random() * 1000),
            title,
            host,
            schedule,
            description,
            status: 'active',
            createdAt: new Date().toISOString()
        }
    });
});

// Update show
router.put('/shows/:id', adminAuth, (req, res) => {
    const { id } = req.params;
    const { title, host, schedule, description, status } = req.body;
    
    res.json({
        success: true,
        message: 'Programa actualizado exitosamente',
        data: {
            id: parseInt(id),
            title,
            host,
            schedule,
            description,
            status,
            updatedAt: new Date().toISOString()
        }
    });
});

// Delete show
router.delete('/shows/:id', adminAuth, (req, res) => {
    const { id } = req.params;
    
    res.json({
        success: true,
        message: 'Programa eliminado exitosamente',
        data: { id: parseInt(id) }
    });
});

// Get analytics
router.get('/analytics', adminAuth, (req, res) => {
    const { period = '7d' } = req.query;
    
    // Mock analytics data
    const mockData = {
        listeners: {
            current: Math.floor(Math.random() * 1000) + 100,
            peak: Math.floor(Math.random() * 1500) + 500,
            average: Math.floor(Math.random() * 800) + 200
        },
        geographic: [
            { country: 'Mexico', listeners: 450 },
            { country: 'Colombia', listeners: 320 },
            { country: 'Spain', listeners: 180 },
            { country: 'Argentina', listeners: 150 }
        ],
        devices: [
            { device: 'Mobile', percentage: 65 },
            { device: 'Desktop', percentage: 30 },
            { device: 'Tablet', percentage: 5 }
        ],
        trending: [
            { song: 'Bohemian Rhapsody', artist: 'Queen', plays: 45 },
            { song: 'Hotel California', artist: 'Eagles', plays: 38 },
            { song: 'Imagine', artist: 'John Lennon', plays: 32 }
        ]
    };
    
    res.json({
        success: true,
        data: mockData,
        period
    });
});

// System settings
router.post('/settings', adminAuth, (req, res) => {
    const settings = req.body;
    
    // Save settings (mock)
    res.json({
        success: true,
        message: 'Configuración guardada exitosamente',
        data: {
            ...settings,
            updatedAt: new Date().toISOString()
        }
    });
});

// User management
router.get('/users', adminAuth, (req, res) => {
    res.json({
        success: true,
        data: [
            {
                id: 1,
                username: 'admin',
                name: 'Administrator',
                email: 'admin@radio.com',
                role: 'admin',
                status: 'active',
                createdAt: '2024-01-01T00:00:00Z',
                lastLogin: new Date().toISOString()
            },
            {
                id: 2,
                username: 'dj1',
                name: 'DJ Morning',
                email: 'dj1@radio.com',
                role: 'dj',
                status: 'active',
                createdAt: '2024-01-15T00:00:00Z',
                lastLogin: new Date(Date.now() - 86400000).toISOString()
            }
        ]
    });
});

module.exports = router;