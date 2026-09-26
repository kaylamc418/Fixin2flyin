const CACHE_NAME = "fixin2flyin-hero-v2-2026-09-26";
const CORE_ASSETS = [
  "/",
  "/styles.css",
  "/hero-refresh.css",
  "/script.js",
  "/privacy.html",
  "/terms.html",
  "/site.webmanifest",
  "/assets/favicon-horus-fullcolor.svg",
  "/assets/apple-touch-icon.png",
  "/assets/hero-mobile.webp",
  "/assets/hero-tablet.webp",
  "/assets/hero-desktop.webp"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => (await caches.match(request)) || caches.match("/"))
    );
    return;
  }

  const cacheableDestination = ["style", "script", "image", "font"].includes(request.destination);
  const cacheablePath = url.pathname.endsWith(".webmanifest");

  if (cacheableDestination || cacheablePath) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      })
    );
  }
});
