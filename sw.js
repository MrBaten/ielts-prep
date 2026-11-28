const CACHE = "ielts-prep-1795847662";
const SHELL = ["./", "./index.html", "./style.css", "./data.js", "./data2.js", "./data3.js", "./data_ex.js", "./data4.js", "./data5.js", "./data_ex2.js", "./data6.js", "./data7.js", "./app.js", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./fonts/manrope-latin-400-normal.woff2", "./fonts/manrope-latin-500-normal.woff2", "./fonts/manrope-latin-600-normal.woff2", "./fonts/manrope-latin-700-normal.woff2", "./fonts/fraunces-latin-600-normal.woff2"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => {
    const net = fetch(e.request).then(res => {
      if (res && (res.ok || res.type === "opaque")) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => hit);
    return hit || net;
  }));
});
