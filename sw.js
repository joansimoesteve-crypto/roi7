// Service worker: hace la web instalable y muestra avisos push de CitizenVoice.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => { if (e.request.mode === 'navigate') e.respondWith(fetch(e.request)); });
self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) {}
  e.waitUntil(self.registration.showNotification(d.title || 'CitizenVoice', { body: d.body || '', icon: '/apple-touch-icon.png', badge: '/favicon.png', data: { url: d.url || '/mapa?near=1' } }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close(); const u = (e.notification.data && e.notification.data.url) || '/mapa?near=1';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => { for (const c of cs) { if ('focus' in c) { c.navigate && c.navigate(u); return c.focus(); } } return self.clients.openWindow(u); }));
});
