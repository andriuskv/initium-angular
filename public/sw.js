self.addEventListener("install", event => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
    if (event.request.url.startsWith("https://images.unsplash.com/")) {
        event.respondWith(
            caches.open("background-image-cache").then(cache => {
                return cache.match(event.request).then(response => {
                    if (response) {
                        return response;
                    }
                    return fetch(event.request).then(response => {
                        return response;
                    });
                })
                .catch(error => {
                    console.error("Error in fetch handler:", error);
                    throw error;
                });
            })
        );
    }
});
