// PWA Manager - Handles service worker, installation, and offline functionality
class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.checkInstallStatus();
        this.setupInstallUI();
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('sw.js');
                console.log('Service Worker registered:', registration.scope);
                
                // Handle updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });

            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the default install prompt
            e.preventDefault();
            
            // Store the event for later use
            this.deferredPrompt = e;
            
            // Show custom install UI
            this.showInstallPrompt();
        });

        // Handle successful installation
        window.addEventListener('appinstalled', (e) => {
            this.isInstalled = true;
            this.hideInstallPrompt();
            this.showNotification('¡App instalada correctamente!', 'success');
            
            // Track installation
            this.trackInstallation();
        });
    }

    checkInstallStatus() {
        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true) {
            this.isInstalled = true;
        }

        // Check if running as PWA
        if (this.isInstalled) {
            document.body.classList.add('pwa-installed');
        }
    }

    setupInstallUI() {
        const installBtn = document.getElementById('install-btn');
        const dismissBtn = document.getElementById('dismiss-install');

        if (installBtn) {
            installBtn.addEventListener('click', () => {
                this.installApp();
            });
        }

        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                this.hideInstallPrompt();
            });
        }
    }

    showInstallPrompt() {
        if (this.isInstalled) return;
        
        const installPrompt = document.getElementById('install-prompt');
        if (installPrompt) {
            installPrompt.style.display = 'block';
            
            // Auto-hide after 30 seconds
            setTimeout(() => {
                this.hideInstallPrompt();
            }, 30000);
        }
    }

    hideInstallPrompt() {
        const installPrompt = document.getElementById('install-prompt');
        if (installPrompt) {
            installPrompt.style.display = 'none';
        }
    }

    async installApp() {
        if (!this.deferredPrompt) {
            this.showNotification('La instalación no está disponible', 'warning');
            return;
        }

        try {
            // Show the install prompt
            this.deferredPrompt.prompt();
            
            // Wait for the user's response
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                this.showNotification('Instalando la aplicación...', 'info');
            } else {
                this.showNotification('Instalación cancelada', 'info');
            }
            
            // Clear the deferred prompt
            this.deferredPrompt = null;
            this.hideInstallPrompt();

        } catch (error) {
            console.error('Error installing app:', error);
            this.showNotification('Error al instalar la aplicación', 'error');
        }
    }

    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <i class="fas fa-download"></i>
                <p>Nueva versión disponible</p>
                <button id="update-btn" class="btn-primary">Actualizar</button>
                <button id="dismiss-update" class="btn-text">Más tarde</button>
            </div>
        `;

        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--surface-color)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-color)',
            zIndex: '1001',
            maxWidth: '350px',
            width: '90%'
        });

        document.body.appendChild(notification);

        // Setup event listeners
        const updateBtn = notification.querySelector('#update-btn');
        const dismissBtn = notification.querySelector('#dismiss-update');

        updateBtn.addEventListener('click', () => {
            this.updateApp();
            notification.remove();
        });

        dismissBtn.addEventListener('click', () => {
            notification.remove();
        });

        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }

    async updateApp() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration && registration.waiting) {
                    // Send message to waiting service worker to skip waiting
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                    
                    // Reload the page to apply updates
                    window.location.reload();
                }
            } catch (error) {
                console.error('Error updating app:', error);
            }
        }
    }

    // Push notifications
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return false;
        }

        let permission = Notification.permission;

        if (permission === 'default') {
            permission = await Notification.requestPermission();
        }

        return permission === 'granted';
    }

    async setupPushNotifications() {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.log('Push notifications are not supported');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            
            // Check if already subscribed
            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                return existingSubscription;
            }

            // Subscribe to push notifications
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY') // Replace with actual key
            });

            // Send subscription to server
            await this.sendSubscriptionToServer(subscription);
            
            return subscription;

        } catch (error) {
            console.error('Error setting up push notifications:', error);
        }
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    async sendSubscriptionToServer(subscription) {
        try {
            const response = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscription: subscription
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send subscription to server');
            }

            console.log('Push subscription sent to server');
        } catch (error) {
            console.error('Error sending subscription to server:', error);
        }
    }

    // Offline functionality
    setupOfflineSupport() {
        window.addEventListener('online', () => {
            this.showNotification('Conexión restaurada', 'success');
            document.body.classList.remove('offline');
        });

        window.addEventListener('offline', () => {
            this.showNotification('Sin conexión - Modo offline activado', 'warning');
            document.body.classList.add('offline');
        });

        // Check initial connection status
        if (!navigator.onLine) {
            document.body.classList.add('offline');
        }
    }

    // Background sync
    async registerBackgroundSync(tag) {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            try {
                const registration = await navigator.serviceWorker.ready;
                await registration.sync.register(tag);
                console.log('Background sync registered:', tag);
            } catch (error) {
                console.error('Background sync registration failed:', error);
            }
        }
    }

    // Analytics and tracking
    trackInstallation() {
        // Track PWA installation
        if (typeof gtag !== 'undefined') {
            gtag('event', 'pwa_install', {
                event_category: 'PWA',
                event_label: 'App Install'
            });
        }

        // Send to custom analytics
        this.sendAnalytics('pwa_install');
    }

    trackUsage(action, category = 'PWA') {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: this.isInstalled ? 'PWA' : 'Browser'
            });
        }

        this.sendAnalytics(action, { category, isPWA: this.isInstalled });
    }

    async sendAnalytics(event, data = {}) {
        try {
            await fetch('/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event: event,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    isPWA: this.isInstalled,
                    ...data
                })
            });
        } catch (error) {
            console.error('Analytics error:', error);
        }
    }

    // Share API
    async shareContent(title, text, url) {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: text,
                    url: url
                });
                this.trackUsage('share_native');
            } catch (error) {
                console.error('Share error:', error);
                this.fallbackShare(url);
            }
        } else {
            this.fallbackShare(url);
        }
    }

    fallbackShare(url) {
        // Fallback to clipboard
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                this.showNotification('Enlace copiado al portapapeles', 'success');
                this.trackUsage('share_clipboard');
            });
        }
    }

    showNotification(message, type = 'info') {
        if (window.radioApp) {
            window.radioApp.showNotification(message, type);
        } else {
            console.log(message);
        }
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.pwaManager) {
            window.pwaManager = new PWAManager();
        }
    });
} else {
    if (!window.pwaManager) {
        window.pwaManager = new PWAManager();
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PWAManager;
}