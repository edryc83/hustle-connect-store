// Push notification event handlers for service worker
self.addEventListener('push', function(event) {
  let data = { title: 'New Order! 🎉', body: 'You have a new order on Afristall', url: '/dashboard/orders' };
  
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/pwa-192.png',
    badge: '/pwa-192.png',
    data: { url: data.url || '/dashboard/orders' },
    vibrate: [200, 100, 200],
    actions: [
      { action: 'view', title: 'View Order' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const url = event.notification.data?.url || '/dashboard/orders';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url.includes('/dashboard') && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open new window
      return clients.openWindow(url);
    })
  );
});
