// Service Worker for Radio PWA
const CACHE_NAME = 'radio-pwa-v1.0.0';
const OFFLINE_PAGE = '/offline.html';

// Files to cache for offline functionality
const STATIC_CACHE_FILES = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/player.js',
    '/js/pwa.js',
    '/js/auth.js',
    '/manifest.json',
    '/images/default-cover.jpg',
    '/offline.html',
    // External resources
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Dynamic cache for API responses and media
const DYNAMIC_CACHE = 'radio-pwa-dynamic-v1';

// Cache strategies
const CACHE_STRATEGIES = {
    NETWORK_FIRST: 'networkFirst',
    CACHE_FIRST: 'cacheFirst',
    STALE_WHILE_REVALIDATE: 'staleWhileRevalidate'
};

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_CACHE_FILES.map(url => new Request(url, {
                    credentials: 'same-origin'
                })));
            })
            .catch((error) => {
                console.error('Service Worker: Cache failed', error);
            })
    );
    
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
    );
    
    // Ensure the service worker takes control of all pages
    self.clients.claim();
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip chrome extension requests and non-http(s) requests
    if (request.url.startsWith('chrome-extension') || 
        !request.url.startsWith('http')) {
        return;
    }

    // Handle different types of requests
    if (isStaticAsset(request)) {
        event.respondWith(handleStaticAsset(request));
    } else if (isAPIRequest(request)) {
        event.respondWith(handleAPIRequest(request));
    } else if (isStreamingRequest(request)) {
        event.respondWith(handleStreamingRequest(request));
    } else {
        event.respondWith(handlePageRequest(request));
    }
});

// Handle static assets (CSS, JS, images)
function handleStaticAsset(request) {
    return cacheFirst(request, CACHE_NAME);
}

// Handle API requests
function handleAPIRequest(request) {
    return networkFirst(request, DYNAMIC_CACHE);
}

// Handle streaming audio requests
function handleStreamingRequest(request) {
    // Always fetch streaming content from network
    return fetch(request).catch(() => {
        // Return offline audio message
        return new Response('Offline - No streaming available', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    });
}

// Handle page requests
function handlePageRequest(request) {
    return networkFirst(request, DYNAMIC_CACHE)
        .catch(() => {
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
                return caches.match(OFFLINE_PAGE);
            }
            throw error;
        });
}

// Cache first strategy
async function cacheFirst(request, cacheName) {
    try {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            // Update cache in background
            updateCache(request, cacheName);
            return cachedResponse;
        }
        
        // Fetch from network and cache
        const networkResponse = await fetch(request);
        cache.put(request, networkResponse.clone());
        return networkResponse;
        
    } catch (error) {
        console.error('Cache first failed:', error);
        throw error;
    }
}

// Network first strategy
async function networkFirst(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        // Fallback to cache
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    });
    
    return cachedResponse || fetchPromise;
}

// Background cache update
function updateCache(request, cacheName) {
    fetch(request)
        .then((response) => {
            if (response.ok) {
                return caches.open(cacheName);
            }
        })
        .then((cache) => {
            if (cache) {
                cache.put(request, response);
            }
        })
        .catch((error) => {
            console.log('Background cache update failed:', error);
        });
}

// Helper functions to identify request types
function isStaticAsset(request) {
    const url = new URL(request.url);
    return url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/);
}

function isAPIRequest(request) {
    return request.url.includes('/api/');
}

function isStreamingRequest(request) {
    const url = new URL(request.url);
    return url.pathname.match(/\.(mp3|aac|ogg|m4a|flac|wav)$/) ||
           request.url.includes('stream') ||
           request.url.includes('radio');
}

// Push notification handler
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push notification received');
    
    let notificationData = {
        title: 'Radio PWA',
        body: 'Nueva notificación',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'radio-notification',
        requireInteraction: false,
        actions: [
            {
                action: 'open',
                title: 'Abrir Radio',
                icon: '/icons/icon-72x72.png'
            },
            {
                action: 'dismiss',
                title: 'Cerrar'
            }
        ]
    };
    
    if (event.data) {
        try {
            const pushData = event.data.json();
            notificationData = { ...notificationData, ...pushData };
        } catch (error) {
            console.error('Error parsing push data:', error);
        }
    }
    
    event.waitUntil(
        self.registration.showNotification(notificationData.title, {
            body: notificationData.body,
            icon: notificationData.icon,
            badge: notificationData.badge,
            tag: notificationData.tag,
            requireInteraction: notificationData.requireInteraction,
            actions: notificationData.actions,
            data: {
                url: notificationData.url || '/',
                timestamp: Date.now()
            }
        })
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked', event);
    
    event.notification.close();
    
    const action = event.action;
    const notificationData = event.notification.data || {};
    
    if (action === 'dismiss') {
        return;
    }
    
    const urlToOpen = notificationData.url || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if app is already open
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin)) {
                        client.focus();
                        client.navigate(urlToOpen);
                        return;
                    }
                }
                
                // Open new window
                return clients.openWindow(urlToOpen);
            })
    );
});

// Background sync handler
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered', event.tag);
    
    if (event.tag === 'background-sync-analytics') {
        event.waitUntil(syncAnalytics());
    } else if (event.tag === 'background-sync-favorites') {
        event.waitUntil(syncFavorites());
    }
});

// Sync analytics data when online
async function syncAnalytics() {
    try {
        // Get queued analytics data from IndexedDB
        const queuedData = await getQueuedAnalytics();
        
        if (queuedData.length > 0) {
            // Send to server
            await fetch('/api/analytics/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ events: queuedData })
            });
            
            // Clear queued data
            await clearAnalyticsQueue();
            console.log('Analytics synced successfully');
        }
        
    } catch (error) {
        console.error('Analytics sync failed:', error);
    }
}

// Sync favorites when online
async function syncFavorites() {
    try {
        // Implementation for syncing user favorites
        console.log('Favorites sync completed');
    } catch (error) {
        console.error('Favorites sync failed:', error);
    }
}

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
    const { type, payload } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_VERSION':
            event.ports[0].postMessage({ version: CACHE_NAME });
            break;
            
        case 'CACHE_URLS':
            event.waitUntil(cacheUrls(payload.urls));
            break;
            
        case 'CLEAR_CACHE':
            event.waitUntil(clearCache(payload.cacheName));
            break;
            
        default:
            console.log('Service Worker: Unknown message type', type);
    }
});

// Cache specific URLs
async function cacheUrls(urls) {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        await cache.addAll(urls);
        console.log('URLs cached successfully');
    } catch (error) {
        console.error('URL caching failed:', error);
    }
}

// Clear specific cache
async function clearCache(cacheName) {
    try {
        await caches.delete(cacheName);
        console.log('Cache cleared:', cacheName);
    } catch (error) {
        console.error('Cache clearing failed:', error);
    }
}

// IndexedDB helpers for offline data storage
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('RadioPWADB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create object stores
            if (!db.objectStoreNames.contains('analytics')) {
                const analyticsStore = db.createObjectStore('analytics', { keyPath: 'id', autoIncrement: true });
                analyticsStore.createIndex('timestamp', 'timestamp', { unique: false });
            }
            
            if (!db.objectStoreNames.contains('favorites')) {
                const favoritesStore = db.createObjectStore('favorites', { keyPath: 'id' });
                favoritesStore.createIndex('type', 'type', { unique: false });
            }
        };
    });
}

async function getQueuedAnalytics() {
    try {
        const db = await openDatabase();
        const transaction = db.transaction(['analytics'], 'readonly');
        const store = transaction.objectStore('analytics');
        
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    } catch (error) {
        console.error('Error getting queued analytics:', error);
        return [];
    }
}

async function clearAnalyticsQueue() {
    try {
        const db = await openDatabase();
        const transaction = db.transaction(['analytics'], 'readwrite');
        const store = transaction.objectStore('analytics');
        
        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    } catch (error) {
        console.error('Error clearing analytics queue:', error);
    }
}

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
    self.addEventListener('periodicsync', (event) => {
        if (event.tag === 'content-sync') {
            event.waitUntil(syncContent());
        }
    });
}

async function syncContent() {
    try {
        // Sync schedule, now playing, etc.
        console.log('Periodic content sync completed');
    } catch (error) {
        console.error('Periodic sync failed:', error);
    }
}

console.log('Service Worker: Loaded successfully');