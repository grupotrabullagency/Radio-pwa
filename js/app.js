// Main application controller
class RadioApp {
    constructor() {
        this.currentSection = 'home';
        this.isAuthenticated = false;
        this.scheduleDate = new Date();
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupMobileMenu();
        this.setupSchedule();
        this.setupHistory();
        this.loadInitialData();
        
        // Initialize other modules
        if (typeof RadioPlayer !== 'undefined') {
            window.radioPlayer = new RadioPlayer();
        }
        if (typeof PWAManager !== 'undefined') {
            window.pwaManager = new PWAManager();
        }
        if (typeof AuthManager !== 'undefined') {
            window.authManager = new AuthManager();
        }
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('.section');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionName = link.getAttribute('data-section');
                this.showSection(sectionName);
            });
        });

        // Handle hash navigation
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.substring(1);
            if (hash) {
                this.showSection(hash);
            }
        });

        // Check initial hash
        const initialHash = window.location.hash.substring(1);
        if (initialHash) {
            this.showSection(initialHash);
        }
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        this.currentSection = sectionName;

        // Close mobile menu
        const navMenu = document.getElementById('nav-menu');
        const navToggle = document.getElementById('nav-toggle');
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');

        // Load section-specific data
        this.loadSectionData(sectionName);
    }

    setupMobileMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }

    setupSchedule() {
        const prevDayBtn = document.getElementById('prev-day');
        const nextDayBtn = document.getElementById('next-day');

        if (prevDayBtn) {
            prevDayBtn.addEventListener('click', () => {
                this.scheduleDate.setDate(this.scheduleDate.getDate() - 1);
                this.updateSchedule();
            });
        }

        if (nextDayBtn) {
            nextDayBtn.addEventListener('click', () => {
                this.scheduleDate.setDate(this.scheduleDate.getDate() + 1);
                this.updateSchedule();
            });
        }
    }

    setupHistory() {
        const searchBtn = document.getElementById('search-history');
        const dateInput = document.getElementById('history-date');

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const selectedDate = dateInput.value;
                this.loadHistory(selectedDate);
            });
        }

        // Set default date to today
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
    }

    loadInitialData() {
        // Load mock data for demonstration
        this.updateStats({
            listeners: Math.floor(Math.random() * 1000),
            songs: Math.floor(Math.random() * 50),
            uptime: Math.floor(Math.random() * 24)
        });

        this.updateSchedule();
        this.loadHistory();
    }

    loadSectionData(sectionName) {
        switch (sectionName) {
            case 'schedule':
                this.updateSchedule();
                break;
            case 'history':
                this.loadHistory();
                break;
            default:
                break;
        }
    }

    updateStats(stats) {
        const listenersCount = document.getElementById('listeners-count');
        const songsPlayed = document.getElementById('songs-played');
        const uptime = document.getElementById('uptime');

        if (listenersCount) listenersCount.textContent = stats.listeners;
        if (songsPlayed) songsPlayed.textContent = stats.songs;
        if (uptime) uptime.textContent = `${stats.uptime}h`;

        // Update dashboard stats if available
        const dashListeners = document.getElementById('dash-listeners');
        const dashSongs = document.getElementById('dash-songs');
        const dashUptime = document.getElementById('dash-uptime');

        if (dashListeners) dashListeners.textContent = stats.listeners;
        if (dashSongs) dashSongs.textContent = stats.songs;
        if (dashUptime) dashUptime.textContent = `${stats.uptime}h`;
    }

    updateSchedule() {
        const scheduleGrid = document.getElementById('schedule-grid');
        const scheduleDateEl = document.getElementById('schedule-date');

        if (!scheduleGrid) return;

        // Update date display
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        if (scheduleDateEl) {
            const today = new Date();
            if (this.scheduleDate.toDateString() === today.toDateString()) {
                scheduleDateEl.textContent = 'Hoy';
            } else {
                scheduleDateEl.textContent = this.scheduleDate.toLocaleDateString('es-ES', options);
            }
        }

        // Mock schedule data
        const mockSchedule = [
            { time: '06:00', title: 'Buenos Días Radio', description: 'Programa matutino con noticias y música' },
            { time: '09:00', title: 'Música y Más', description: 'Los mejores éxitos del momento' },
            { time: '12:00', title: 'Mediodía Informativo', description: 'Noticias al mediodía' },
            { time: '15:00', title: 'Tarde de Música', description: 'Música variada para la tarde' },
            { time: '18:00', title: 'Drive Time', description: 'Música para el camino a casa' },
            { time: '21:00', title: 'Noche de Radio', description: 'Programa nocturno' },
            { time: '00:00', title: 'Música Nocturna', description: 'Música suave para la noche' }
        ];

        scheduleGrid.innerHTML = '';
        mockSchedule.forEach(item => {
            const scheduleItem = document.createElement('div');
            scheduleItem.className = 'schedule-item';
            scheduleItem.innerHTML = `
                <div class="schedule-time">${item.time}</div>
                <div class="schedule-info">
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
                </div>
            `;
            scheduleGrid.appendChild(scheduleItem);
        });
    }

    loadHistory(date = null) {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;

        const targetDate = date ? new Date(date) : new Date();
        
        // Mock history data
        const mockHistory = [
            { time: '15:30', title: 'Bohemian Rhapsody', artist: 'Queen', duration: '5:55' },
            { time: '15:24', title: 'Hotel California', artist: 'Eagles', duration: '6:30' },
            { time: '15:17', title: 'Sweet Child O\' Mine', artist: 'Guns N\' Roses', duration: '5:56' },
            { time: '15:11', title: 'Stairway to Heaven', artist: 'Led Zeppelin', duration: '8:02' },
            { time: '15:03', title: 'Imagine', artist: 'John Lennon', duration: '3:07' },
            { time: '14:58', title: 'Like a Rolling Stone', artist: 'Bob Dylan', duration: '6:13' },
            { time: '14:51', title: 'Billie Jean', artist: 'Michael Jackson', duration: '4:54' },
            { time: '14:46', title: 'Yesterday', artist: 'The Beatles', duration: '2:05' },
            { time: '14:43', title: 'Purple Haze', artist: 'Jimi Hendrix', duration: '2:50' },
            { time: '14:40', title: 'Good Vibrations', artist: 'The Beach Boys', duration: '3:36' }
        ];

        historyList.innerHTML = '';
        mockHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-time">${item.time}</div>
                <div class="history-track">
                    <h4>${item.title}</h4>
                    <p>${item.artist}</p>
                </div>
                <div class="history-duration">${item.duration}</div>
            `;
            historyList.appendChild(historyItem);
        });
    }

    // API methods for real implementation
    async fetchFromAPI(endpoint, options = {}) {
        try {
            const response = await fetch(`/api/${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Fetch Error:', error);
            return null;
        }
    }

    // MongoDB integration methods (to be implemented with backend)
    async saveToMongoDB(collection, data) {
        return this.fetchFromAPI(`mongodb/${collection}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async getFromMongoDB(collection, query = {}) {
        const queryString = Object.keys(query).length > 0 ? 
            '?' + new URLSearchParams(query).toString() : '';
        
        return this.fetchFromAPI(`mongodb/${collection}${queryString}`);
    }

    // AzuraCast integration
    async getAzuraCastData() {
        return this.fetchFromAPI('azuracast/nowplaying');
    }

    // ZenoFM integration
    async getZenoFMData() {
        return this.fetchFromAPI('zenofm/stats');
    }

    // Utility methods
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '90px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '1002',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px'
        });

        // Set background color based on type
        const colors = {
            info: '#6366f1',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.radioApp = new RadioApp();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RadioApp;
}