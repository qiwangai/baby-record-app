const CACHE_NAME = "baby-record-v2";
const scopePath = new URL(self.registration.scope).pathname.replace(/\/$/, "");
const BASE_PATH = scopePath === "" ? "" : scopePath;
const APP_SHELL = [
  `${BASE_PATH}/baby/`,
  `${BASE_PATH}/manifest.webmanifest`,
  `${BASE_PATH}/apple-touch-icon.png`,
  `${BASE_PATH}/baby-icon-192.png`,
  `${BASE_PATH}/baby-icon-512.png`,
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;
  if (!requestUrl.pathname.startsWith(`${BASE_PATH}/baby`) && !requestUrl.pathname.startsWith(`${BASE_PATH}/_next`)) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    }),
  );
});
