"use strict";

const CACHE_NAME = "lernapp-v1";
const FILES_TO_CACHE = [
  "/Lernprogramm/",
  "/Lernprogramm/index.html",
  "/Lernprogramm/style.css",
  "/Lernprogramm/app.js",
  "/Lernprogramm/manifest.json",
  "/Lernprogramm/sw.js",
  "/Lernprogramm/data/fragen.json"
];

// Installation: Dateien cachen
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Aktivierung: Alte Caches löschen
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keyList => 
      Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }))
    )
  );
  self.clients.claim();
});

// Fetch: Versuche zuerst aus Cache zu laden, sonst aus dem Netz
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
