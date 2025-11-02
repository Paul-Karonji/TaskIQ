// Service Worker for DueSync
// Handles push notifications and offline caching

const CACHE_NAME = 'taskiq-v1';
const TASK_URL_BASE = '/';

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  return self.clients.claim();
});

// Push event - display notification
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);

  if (!event.data) {
    console.log('[Service Worker] Push event has no data');
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (error) {
    console.error('[Service Worker] Error parsing push data:', error);
    data = {
      title: 'DueSync Reminder',
      body: event.data.text(),
    };
  }

  const title = data.title || 'DueSync Reminder';
  const options = {
    body: data.body || 'You have a task reminder',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: data.taskId || 'taskiq-notification',
    requireInteraction: data.requireInteraction || false,
    data: {
      taskId: data.taskId,
      url: data.url || TASK_URL_BASE,
      priority: data.priority,
    },
    actions: [
      {
        action: 'view',
        title: 'View Task',
        icon: '/icons/view.png',
      },
      {
        action: 'complete',
        title: 'Mark Complete',
        icon: '/icons/check.png',
      },
    ],
    vibrate: [200, 100, 200],
    sound: '/sounds/notification.mp3',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event);

  event.notification.close();

  const action = event.action;
  const taskId = event.notification.data?.taskId;
  const url = event.notification.data?.url || TASK_URL_BASE;

  if (action === 'complete' && taskId) {
    // Mark task as complete
    event.waitUntil(
      fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'COMPLETED',
          completedAt: new Date().toISOString(),
        }),
      })
        .then((response) => {
          if (response.ok) {
            console.log('[Service Worker] Task marked as complete');
            return self.registration.showNotification('Task Completed!', {
              body: 'Great job! Task marked as complete.',
              icon: '/icon-192.png',
              tag: 'task-completed',
            });
          }
        })
        .catch((error) => {
          console.error('[Service Worker] Error completing task:', error);
        })
    );
  } else {
    // Open the app or focus existing window
    event.waitUntil(
      clients
        .matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url === url && 'focus' in client) {
              return client.focus();
            }
          }
          // Open new window if not open
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification closed:', event);
});

// Message event - communicate with clients
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync (optional - for offline task creation)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);

  if (event.tag === 'sync-tasks') {
    event.waitUntil(
      // Implement background sync logic here if needed
      Promise.resolve()
    );
  }
});
