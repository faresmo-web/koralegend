// ============================================================
//  KoraLegend — Service Worker for Push Notifications
//  Listens to push events and displays notification banner
// ============================================================

self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', event => {
    let data = { 
        title: 'Kora Legend | كورة ليجند', 
        body: 'تحديث جديد للمباريات والأخبار المباشرة.', 
        icon: '/notification_icon.png', 
        data: { url: '/matches' } 
    };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || '/notification_icon.png',
        badge: '/notification_icon.png', // smaller icon for status bar
        sound: '/mixkit-arcade-bonus-alert-767.wav', // For Android / supported devices
        vibrate: [200, 100, 200, 100, 200],
        data: data.data || { url: '/matches' },
        dir: 'rtl',
        lang: 'ar'
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options).then(() => {
            // Also notify any open pages to play the sound immediately
            return clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
                clientList.forEach(client => {
                    client.postMessage({ type: 'PLAY_SOUND' });
                });
            });
        })
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || '/matches';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            // Check if there is already a window open with this path
            const targetPath = new URL(targetUrl, self.location.origin).pathname;
            for (const client of clientList) {
                const clientPath = new URL(client.url).pathname;
                if (clientPath === targetPath && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open a new window
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
