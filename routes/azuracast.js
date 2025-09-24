const express = require('express');
const router = express.Router();

// Get current playing info
router.get('/nowplaying', (req, res) => {
    // Mock data for demo
    const mockData = {
        success: true,
        data: {
            current_song: {
                title: 'Bohemian Rhapsody',
                artist: 'Queen',
                album: 'A Night at the Opera',
                duration: 355,
                artwork: '/images/default-cover.jpg'
            },
            listeners: {
                current: Math.floor(Math.random() * 1000) + 100,
                unique: Math.floor(Math.random() * 500) + 50
            },
            live: {
                is_live: true,
                streamer_name: 'DJ Radio',
                broadcast_start: new Date(Date.now() - 3600000).toISOString()
            },
            schedule: [
                {
                    start_time: '06:00',
                    end_time: '09:00',
                    title: 'Buenos Días Radio',
                    description: 'Programa matutino'
                },
                {
                    start_time: '09:00',
                    end_time: '12:00',
                    title: 'Música y Más',
                    description: 'Los mejores éxitos'
                }
            ]
        }
    };

    res.json(mockData);
});

// Get song history
router.get('/history', (req, res) => {
    const mockHistory = {
        success: true,
        data: [
            {
                played_at: new Date(Date.now() - 300000).toISOString(),
                song: {
                    title: 'Hotel California',
                    artist: 'Eagles',
                    duration: 391
                }
            },
            {
                played_at: new Date(Date.now() - 600000).toISOString(),
                song: {
                    title: 'Sweet Child O\' Mine',
                    artist: 'Guns N\' Roses',
                    duration: 356
                }
            }
        ]
    };

    res.json(mockHistory);
});

// Get listeners stats
router.get('/listeners', (req, res) => {
    res.json({
        success: true,
        data: {
            current: Math.floor(Math.random() * 1000) + 100,
            peak_today: Math.floor(Math.random() * 1500) + 500,
            unique_today: Math.floor(Math.random() * 800) + 200
        }
    });
});

module.exports = router;