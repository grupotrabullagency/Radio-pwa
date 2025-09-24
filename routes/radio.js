const express = require('express');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get dashboard stats
router.get('/stats', auth, (req, res) => {
    // Mock dashboard statistics
    const stats = {
        success: true,
        data: {
            currentListeners: Math.floor(Math.random() * 1000) + 100,
            songsToday: Math.floor(Math.random() * 200) + 50,
            uptimeHours: Math.floor(Math.random() * 24) + 1,
            peakListeners: Math.floor(Math.random() * 1500) + 500,
            totalUsers: 1250,
            storageUsed: '2.4 GB',
            bandwidth: '125.6 MB/h'
        }
    };

    res.json(stats);
});

// Get recent activity
router.get('/activity', auth, (req, res) => {
    const activity = {
        success: true,
        data: [
            {
                timestamp: new Date().toISOString(),
                type: 'listener_join',
                message: 'New listener connected from Mexico',
                icon: 'user-plus'
            },
            {
                timestamp: new Date(Date.now() - 300000).toISOString(),
                type: 'song_change',
                message: 'Now playing: Bohemian Rhapsody by Queen',
                icon: 'music'
            },
            {
                timestamp: new Date(Date.now() - 600000).toISOString(),
                type: 'system',
                message: 'Stream quality optimized',
                icon: 'cog'
            }
        ]
    };

    res.json(activity);
});

// Update radio settings (admin only)
router.post('/settings', auth, (req, res) => {
    const { radioName, description, genre, website } = req.body;
    
    // In real implementation, save to database
    res.json({
        success: true,
        message: 'Configuración actualizada exitosamente',
        data: {
            radioName,
            description,
            genre,
            website,
            updatedAt: new Date().toISOString()
        }
    });
});

// Get system health
router.get('/health', auth, (req, res) => {
    res.json({
        success: true,
        data: {
            server: {
                status: 'healthy',
                uptime: '7 days, 14 hours',
                cpu: '23%',
                memory: '67%',
                disk: '45%'
            },
            streaming: {
                status: 'online',
                bitrate: '128 kbps',
                format: 'MP3',
                encoder: 'LAME'
            },
            database: {
                status: 'connected',
                ping: '2ms',
                collections: 5
            }
        }
    });
});

module.exports = router;