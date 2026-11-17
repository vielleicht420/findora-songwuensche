/* Service Worker: App-Hülle offline, data.json immer zuerst aus dem Netz */
const VERSION = "fsw-v3";
const SHELL = ["./", "index.html", "styles.css?v=3", "app.js?v=3", "manifest.webmanifest",
  "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/favicon-32.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  if (url.pathname.endsWith("/data.json")) {
    // network-first, damit neue Daten sofort ankommen; offline: letzte Version
    e.respondWith(
      fetch(e.request, { cache: "no-store" }).then((r) => {
        if (r.ok) { const copy = r.clone(); caches.open(VERSION).then((c) => c.put("data.json", copy)); }
        return r;
      }).catch(() => caches.match("data.json"))
    );
    return;
  }
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open(VERSION).then((c) => c.put("index.html", copy)); return r; })
      .catch(() => caches.match("index.html")));
    return;
  }
  // App-Dateien: stale-while-revalidate
  e.respondWith(caches.match(e.request).then((hit) => {
    const net = fetch(e.request).then((r) => { if (r.ok) { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});
