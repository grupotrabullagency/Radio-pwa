const axios = require('axios');

class StreamMonitor {
    constructor() {
        this.streams = [
            {
                name: 'AzuraCast Demo',
                url: 'https://demo.azuracast.com/api/nowplaying',
                type: 'azuracast',
                active: false
            },
            {
                name: 'ZenoFM Demo',
                url: 'https://zeno.fm/api/stream-info/demo',
                type: 'zenofm',
                active: false
            }
        ];

        this.currentStats = {
            listeners: 0,
            currentSong: null,
            isLive: false,
            uptime: 0
        };

        this.startMonitoring();
    }

    startMonitoring() {
        console.log('Stream monitor started');
        
        // Check streams every 30 seconds
        setInterval(() => {
            this.checkAllStreams();
        }, 30000);

        // Initial check
        this.checkAllStreams();
    }

    async checkAllStreams() {
        for (const stream of this.streams) {
            try {
                await this.checkStream(stream);
            } catch (error) {
                console.error(`Error checking stream ${stream.name}:`, error.message);
                stream.active = false;
            }
        }

        this.updateCurrentStats();
    }

    async checkStream(stream) {
        try {
            const response = await axios.get(stream.url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Radio-PWA-Monitor/1.0'
                }
            });

            if (response.status === 200) {
                stream.active = true;
                stream.lastCheck = new Date();
                stream.data = response.data;
                
                console.log(`Stream ${stream.name} is active`);
            } else {
                stream.active = false;
            }
        } catch (error) {
            stream.active = false;
            stream.error = error.message;
            console.log(`Stream ${stream.name} is inactive:`, error.message);
        }
    }

    updateCurrentStats() {
        // Find first active stream
        const activeStream = this.streams.find(s => s.active);
        
        if (activeStream) {
            this.extractStatsFromStream(activeStream);
            this.broadcastUpdate();
        } else {
            // No active streams
            this.currentStats = {
                listeners: 0,
                currentSong: null,
                isLive: false,
                uptime: 0
            };
        }
    }

    extractStatsFromStream(stream) {
        try {
            if (stream.type === 'azuracast' && stream.data) {
                this.currentStats = {
                    listeners: stream.data.listeners?.total || 0,
                    currentSong: stream.data.now_playing?.song || null,
                    isLive: stream.data.live?.is_live || false,
                    uptime: this.calculateUptime(stream.data.cache || 0),
                    streamName: stream.name
                };
            } else if (stream.type === 'zenofm' && stream.data) {
                this.currentStats = {
                    listeners: stream.data.CURRENTLISTENERS || 0,
                    currentSong: {
                        title: stream.data.title || '',
                        artist: stream.data.artist || ''
                    },
                    isLive: true,
                    uptime: 0, // ZenoFM doesn't provide uptime
                    streamName: stream.name
                };
            }
        } catch (error) {
            console.error('Error extracting stats:', error);
        }
    }

    calculateUptime(cacheTime) {
        // Convert cache time to hours
        return Math.floor(cacheTime / 3600) || 0;
    }

    broadcastUpdate() {
        // In a real implementation, this would broadcast via WebSocket
        // For now, just log the current stats
        console.log('Current stats:', this.currentStats);
        
        // Emit to connected clients if using Socket.io
        // io.emit('streamUpdate', this.currentStats);
    }

    getStats() {
        return {
            streams: this.streams.map(s => ({
                name: s.name,
                type: s.type,
                active: s.active,
                lastCheck: s.lastCheck,
                error: s.error
            })),
            current: this.currentStats
        };
    }

    addStream(streamConfig) {
        this.streams.push({
            ...streamConfig,
            active: false,
            lastCheck: null
        });
    }

    removeStream(streamName) {
        this.streams = this.streams.filter(s => s.name !== streamName);
    }
}

// Create singleton instance
const streamMonitor = new StreamMonitor();

module.exports = streamMonitor;