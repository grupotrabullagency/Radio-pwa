const express = require('express');
const router = express.Router();

// Generic MongoDB operations for demo purposes
// In a real app, you'd have specific routes for different collections

// Create document
router.post('/:collection', (req, res) => {
    const { collection } = req.params;
    const data = req.body;
    
    // Mock response
    res.json({
        success: true,
        message: `Document created in ${collection}`,
        data: {
            ...data,
            _id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString()
        }
    });
});

// Read documents
router.get('/:collection', (req, res) => {
    const { collection } = req.params;
    const { limit = 10, skip = 0 } = req.query;
    
    // Mock response based on collection
    let mockData = [];
    
    switch (collection) {
        case 'songs':
            mockData = [
                {
                    _id: '1',
                    title: 'Bohemian Rhapsody',
                    artist: 'Queen',
                    duration: 355,
                    playCount: 1250,
                    createdAt: '2024-01-01T00:00:00Z'
                },
                {
                    _id: '2',
                    title: 'Hotel California',
                    artist: 'Eagles',
                    duration: 391,
                    playCount: 980,
                    createdAt: '2024-01-02T00:00:00Z'
                }
            ];
            break;
            
        case 'playlists':
            mockData = [
                {
                    _id: '1',
                    name: 'Rock Classics',
                    description: 'The best rock songs of all time',
                    songs: ['1', '2'],
                    createdAt: '2024-01-01T00:00:00Z'
                }
            ];
            break;
            
        case 'analytics':
            mockData = [
                {
                    _id: '1',
                    event: 'song_play',
                    songId: '1',
                    timestamp: new Date().toISOString(),
                    listeners: 450,
                    location: 'Mexico'
                }
            ];
            break;
            
        default:
            mockData = [
                {
                    _id: '1',
                    message: `Mock data for ${collection} collection`,
                    createdAt: new Date().toISOString()
                }
            ];
    }
    
    res.json({
        success: true,
        data: mockData.slice(parseInt(skip), parseInt(skip) + parseInt(limit)),
        total: mockData.length,
        collection
    });
});

// Update document
router.put('/:collection/:id', (req, res) => {
    const { collection, id } = req.params;
    const updates = req.body;
    
    res.json({
        success: true,
        message: `Document ${id} updated in ${collection}`,
        data: {
            _id: id,
            ...updates,
            updatedAt: new Date().toISOString()
        }
    });
});

// Delete document
router.delete('/:collection/:id', (req, res) => {
    const { collection, id } = req.params;
    
    res.json({
        success: true,
        message: `Document ${id} deleted from ${collection}`,
        data: { _id: id, deletedAt: new Date().toISOString() }
    });
});

// Aggregate operations
router.post('/:collection/aggregate', (req, res) => {
    const { collection } = req.params;
    const pipeline = req.body.pipeline || [];
    
    // Mock aggregation results
    let mockResult = [];
    
    if (collection === 'analytics') {
        mockResult = [
            { _id: 'Mexico', totalListeners: 450, avgDuration: 180 },
            { _id: 'Colombia', totalListeners: 320, avgDuration: 165 },
            { _id: 'Spain', totalListeners: 180, avgDuration: 200 }
        ];
    } else if (collection === 'songs') {
        mockResult = [
            { _id: 'Rock', count: 150, totalPlays: 45000 },
            { _id: 'Pop', count: 120, totalPlays: 38000 },
            { _id: 'Jazz', count: 80, totalPlays: 22000 }
        ];
    }
    
    res.json({
        success: true,
        data: mockResult,
        collection,
        pipeline
    });
});

module.exports = router;