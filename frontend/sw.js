const CACHE_NAME = 'pawfect-care-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/pages/book-appointment.html',
    '/pages/appointment-confirmation.html',
    '/pages/login.html',
    '/styles.css',
    '/app.js',
    '/js/forms.js',
    '/assets/js/book-appointment.js',
    '/bootstrap/css/bootstrap.min.css',
    '/bootstrap/js/bootstrap.bundle.min.js',
    '/assets/css/appointments.css',
    '/assets/images/logo.webp',
    '/assets/images/up-arrow.png',
    '/assets/images/facebook.png',
    '/assets/images/instagram.png',
    '/assets/images/x.png',
    '/assets/images/location.png',
    '/assets/images/phone.png',
    '/assets/images/email.png',
    '/assets/images/pet-care-bg.webp',
    '/assets/icons/bootstrap-icons.css',
    '/assets/icons/fonts/bootstrap-icons.woff',
    '/assets/icons/fonts/bootstrap-icons.woff2'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => {
            console.log('Opened cache');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
        .then((response) => {
            // Cache hit - return response
            if (response) {
                return response;
            }

            // Clone the request
            const fetchRequest = event.request.clone();

            return fetch(fetchRequest).then(
                (response) => {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }
            );
        })
    );
});