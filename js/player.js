// Radio Player Controller
class RadioPlayer {
    constructor() {
        this.audio = document.getElementById('radio-player');
        this.isPlaying = false;
        this.volume = 0.5;
        this.currentStream = '';
        this.streams = {
            azuracast: 'https://demo.azuracast.com/radio/8000/radio.mp3', // Demo stream
            zenofm: 'https://zeno.fm/radio/example-stream/' // Example stream
        };
        
        this.init();
    }

    init() {
        this.setupControls();
        this.setupVolumeControl();
        this.setupStreamSelector();
        this.setupAudioEvents();
        this.updateUI();
    }

    setupControls() {
        const playBtn = document.getElementById('play-btn');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        if (playBtn) {
            playBtn.addEventListener('click', () => {
                this.togglePlay();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.previousTrack();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextTrack();
            });
        }
    }

    setupVolumeControl() {
        const volumeSlider = document.getElementById('volume-slider');
        
        if (volumeSlider) {
            volumeSlider.value = this.volume * 100;
            
            volumeSlider.addEventListener('input', (e) => {
                this.setVolume(e.target.value / 100);
            });
        }
    }

    setupStreamSelector() {
        const streamSelector = document.getElementById('stream-source');
        
        if (streamSelector) {
            streamSelector.addEventListener('change', (e) => {
                const selectedStream = e.target.value;
                if (selectedStream && this.streams[selectedStream]) {
                    this.loadStream(selectedStream, this.streams[selectedStream]);
                }
            });
        }
    }

    setupAudioEvents() {
        if (!this.audio) return;

        // Loading events
        this.audio.addEventListener('loadstart', () => {
            this.updateStreamStatus('Cargando...', false);
        });

        this.audio.addEventListener('canplay', () => {
            this.updateStreamStatus('Listo', true);
        });

        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.updateUI();
            this.updateStreamStatus('Reproduciendo', true);
        });

        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updateUI();
            this.updateStreamStatus('Pausado', false);
        });

        this.audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            this.updateStreamStatus('Error de conexión', false);
            this.showError('Error al reproducir el stream de audio');
        });

        this.audio.addEventListener('stalled', () => {
            this.updateStreamStatus('Buffering...', false);
        });

        this.audio.addEventListener('waiting', () => {
            this.updateStreamStatus('Buffering...', false);
        });

        // Volume change
        this.audio.addEventListener('volumechange', () => {
            this.volume = this.audio.volume;
            this.updateVolumeUI();
        });
    }

    async togglePlay() {
        if (!this.currentStream) {
            this.showError('Por favor selecciona una emisora primero');
            return;
        }

        try {
            if (this.isPlaying) {
                await this.pause();
            } else {
                await this.play();
            }
        } catch (error) {
            console.error('Playback error:', error);
            this.showError('Error al reproducir el audio');
        }
    }

    async play() {
        if (!this.audio || !this.currentStream) return;

        try {
            await this.audio.play();
            this.startMetadataUpdater();
        } catch (error) {
            throw error;
        }
    }

    pause() {
        if (!this.audio) return;
        
        this.audio.pause();
        this.stopMetadataUpdater();
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.audio) {
            this.audio.volume = this.volume;
        }
        this.updateVolumeUI();
    }

    loadStream(streamType, url) {
        if (!this.audio) return;

        // Stop current playback
        this.pause();
        
        this.currentStream = url;
        this.audio.src = url;
        this.audio.load();
        
        this.updateStreamStatus('Cargando nueva emisora...', false);
        this.updateTrackInfo('Conectando...', streamType.toUpperCase());

        // Update UI
        const streamSelector = document.getElementById('stream-source');
        if (streamSelector) {
            streamSelector.value = streamType;
        }

        this.showNotification(`Emisora cambiada a ${streamType.toUpperCase()}`);
    }

    previousTrack() {
        // In a live radio context, this might switch to previous station
        // or request previous track from API
        this.showNotification('Función no disponible en radio en vivo');
    }

    nextTrack() {
        // In a live radio context, this might switch to next station
        // or request next track from API  
        this.showNotification('Función no disponible en radio en vivo');
    }

    updateUI() {
        const playBtn = document.getElementById('play-btn');
        if (playBtn) {
            const icon = playBtn.querySelector('i');
            if (icon) {
                icon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
            }
        }
    }

    updateVolumeUI() {
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider && !document.activeElement === volumeSlider) {
            volumeSlider.value = this.volume * 100;
        }
    }

    updateStreamStatus(status, isConnected) {
        const statusElement = document.getElementById('stream-status');
        const statusDot = document.querySelector('.status-dot');
        
        if (statusElement) {
            statusElement.textContent = status;
        }
        
        if (statusDot) {
            statusDot.classList.toggle('connected', isConnected);
        }
    }

    updateTrackInfo(title, artist = '', artwork = '') {
        const titleElement = document.getElementById('current-track');
        const artistElement = document.getElementById('current-artist');
        const artworkElement = document.getElementById('track-artwork');
        
        if (titleElement) {
            titleElement.textContent = title;
        }
        
        if (artistElement) {
            artistElement.textContent = artist;
        }
        
        if (artworkElement && artwork) {
            artworkElement.src = artwork;
        } else if (artworkElement) {
            artworkElement.src = 'images/default-cover.jpg';
        }
    }

    // Metadata updates from streaming services
    startMetadataUpdater() {
        this.stopMetadataUpdater();
        
        this.metadataInterval = setInterval(async () => {
            try {
                await this.updateNowPlaying();
            } catch (error) {
                console.error('Error updating metadata:', error);
            }
        }, 10000); // Update every 10 seconds
    }

    stopMetadataUpdater() {
        if (this.metadataInterval) {
            clearInterval(this.metadataInterval);
            this.metadataInterval = null;
        }
    }

    async updateNowPlaying() {
        try {
            let data = null;
            
            // Get current stream info based on selected stream
            const streamSelector = document.getElementById('stream-source');
            const currentStreamType = streamSelector ? streamSelector.value : '';
            
            switch (currentStreamType) {
                case 'azuracast':
                    data = await this.getAzuraCastMetadata();
                    break;
                case 'zenofm':
                    data = await this.getZenoFMMetadata();
                    break;
                default:
                    return;
            }

            if (data) {
                this.updateTrackInfo(
                    data.title || 'Título desconocido',
                    data.artist || 'Artista desconocido',
                    data.artwork || ''
                );

                // Update stats if available
                if (data.listeners !== undefined && window.radioApp) {
                    window.radioApp.updateStats({
                        listeners: data.listeners,
                        songs: data.songs || 0,
                        uptime: data.uptime || 0
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching now playing data:', error);
        }
    }

    async getAzuraCastMetadata() {
        try {
            // Replace with actual AzuraCast API endpoint
            const response = await fetch('/api/azuracast/nowplaying');
            if (!response.ok) {
                throw new Error('AzuraCast API error');
            }
            
            const data = await response.json();
            return {
                title: data.now_playing?.song?.title,
                artist: data.now_playing?.song?.artist,
                artwork: data.now_playing?.song?.art,
                listeners: data.listeners?.total || 0
            };
        } catch (error) {
            // Fallback to mock data for demo
            return this.getMockMetadata();
        }
    }

    async getZenoFMMetadata() {
        try {
            // Replace with actual ZenoFM API endpoint
            const response = await fetch('/api/zenofm/metadata');
            if (!response.ok) {
                throw new Error('ZenoFM API error');
            }
            
            const data = await response.json();
            return {
                title: data.title,
                artist: data.artist,
                artwork: data.picture,
                listeners: data.CURRENTLISTENERS || 0
            };
        } catch (error) {
            // Fallback to mock data for demo
            return this.getMockMetadata();
        }
    }

    getMockMetadata() {
        const mockTracks = [
            { title: 'Bohemian Rhapsody', artist: 'Queen' },
            { title: 'Hotel California', artist: 'Eagles' },
            { title: 'Sweet Child O\' Mine', artist: 'Guns N\' Roses' },
            { title: 'Stairway to Heaven', artist: 'Led Zeppelin' },
            { title: 'Imagine', artist: 'John Lennon' },
            { title: 'Like a Rolling Stone', artist: 'Bob Dylan' }
        ];
        
        const randomTrack = mockTracks[Math.floor(Math.random() * mockTracks.length)];
        
        return {
            ...randomTrack,
            listeners: Math.floor(Math.random() * 500) + 100,
            artwork: 'images/default-cover.jpg'
        };
    }

    // Media Session API for better mobile/desktop integration
    setupMediaSession() {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('play', () => {
                this.play();
            });
            
            navigator.mediaSession.setActionHandler('pause', () => {
                this.pause();
            });

            navigator.mediaSession.setActionHandler('previoustrack', () => {
                this.previousTrack();
            });

            navigator.mediaSession.setActionHandler('nexttrack', () => {
                this.nextTrack();
            });
        }
    }

    updateMediaSession(title, artist, artwork) {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: title,
                artist: artist,
                album: 'Radio en Vivo',
                artwork: artwork ? [{ src: artwork, sizes: '300x300', type: 'image/jpeg' }] : []
            });
        }
    }

    showError(message) {
        if (window.radioApp) {
            window.radioApp.showNotification(message, 'error');
        } else {
            console.error(message);
        }
    }

    showNotification(message) {
        if (window.radioApp) {
            window.radioApp.showNotification(message, 'info');
        } else {
            console.log(message);
        }
    }

    // Cleanup
    destroy() {
        this.stopMetadataUpdater();
        if (this.audio) {
            this.pause();
            this.audio.src = '';
        }
    }
}

// Auto-initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.radioPlayer) {
            window.radioPlayer = new RadioPlayer();
        }
    });
} else {
    if (!window.radioPlayer) {
        window.radioPlayer = new RadioPlayer();
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RadioPlayer;
}