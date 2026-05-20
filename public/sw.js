const CACHE_NAME = 'watchly-shell-v1'
const APP_SHELL = ['/', '/manifest.webmanifest', '/pwa-192.svg', '/pwa-512.svg']

self.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)))
	self.skipWaiting()
})

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
	)
	self.clients.claim()
})

self.addEventListener('fetch', (event) => {
	const { request } = event
	const url = new URL(request.url)

	if (request.method !== 'GET' || url.pathname.startsWith('/api')) return

	event.respondWith(
		caches.match(request).then((cached) => {
			if (cached) return cached
			return fetch(request)
				.then((response) => {
					if (response.ok && url.origin === self.location.origin) {
						const copy = response.clone()
						caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
					}
					return response
				})
				.catch(() => caches.match('/'))
		}),
	)
})
