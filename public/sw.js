// Minimal service worker — makes Avnik installable (PWA). Caching can be expanded later.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {
  // pass-through for MVP; offline caching is a v2 enhancement
});
