const express = require('express');
const router = express.Router();

// Get ZenoFM metadata
router.get('/metadata', (req, res) => {
    // Mock ZenoFM API response
    const mockData = {
        success: true,
        data: {
            title: 'Imagine',
            artist: 'John Lennon',
            picture: '/images/default-cover.jpg',
            CURRENTLISTENERS: Math.floor(Math.random() * 500) + 50,
            MAXLISTENERS: Math.floor(Math.random() * 1000) + 500,
            SERVERGENRE: 'Rock, Pop, Classic',
            SERVERURL: 'https://zeno.fm/radio/demo-stream/',
            SERVERTITLE: 'Demo Radio Station',
            SERVERDESCRIPTION: 'The best music 24/7'
        }
    };

    res.json(mockData);
});

// Get ZenoFM stats
router.get('/stats', (req, res) => {
    res.json({
        success: true,
        data: {
            listeners: {
                current: Math.floor(Math.random() * 500) + 50,
                peak: Math.floor(Math.random() * 800) + 200,
                unique: Math.floor(Math.random() * 300) + 100
            },
            uptime: Math.floor(Math.random() * 24) + 1,
            bitrate: '128 kbps',
            format: 'MP3',
            status: 'online'
        }
    });
});

// Get ZenoFM schedule
router.get('/schedule', (req, res) => {
    const mockSchedule = {
        success: true,
        data: {
            today: [
                {
                    time: '06:00',
                    title: 'Morning Show',
                    host: 'DJ Morning',
                    description: 'Start your day with great music'
                },
                {
                    time: '09:00',
                    title: 'Music Mix',
                    host: 'Auto DJ',
                    description: 'Non-stop music hits'
                },
                {
                    time: '18:00',
                    title: 'Evening Drive',
                    host: 'DJ Evening',
                    description: 'Music for your drive home'
                }
            ]
        }
    };

    res.json(mockSchedule);
});

module.exports = router;