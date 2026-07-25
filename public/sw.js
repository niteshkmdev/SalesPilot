/* SalesPilot minimal service worker — install criteria + light shell cache. */
const CACHE_NAME = "salespilot-shell-v1";
const SHELL_ASSETS = [
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
  "/brand/salespilot-mark.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Network-first for navigations
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isShellAsset =
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/brand/") ||
    SHELL_ASSETS.includes(url.pathname);

  if (!isShellAsset) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
      return cached || network;
    }),
  );
});
