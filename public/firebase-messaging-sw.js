// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.5.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.5.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
const firebaseConfig = {
  apiKey: "AIzaSyBtKTX9C19P06nk_rJlA3dT6ujy48p7M3k",
  authDomain: "tasbroroyal-67653.firebaseapp.com",
  projectId: "tasbroroyal-67653",
  storageBucket: "tasbroroyal-67653.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789012"
};

firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message: ', payload);
  
  const notificationTitle = payload.notification?.title || '⏰ Time to Reply!';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a reminder due',
    icon: '/notification-icon.svg',
    badge: '/notification-icon.svg',
    tag: payload.data?.reminderId || 'reminder',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: '💬 Open ReplyLater'
      },
      {
        action: 'snooze',
        title: '⏰ Snooze 15min'
      }
    ],
    data: payload.data
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);
  
  event.notification.close();
  
  if (event.action === 'open') {
    // Open ReplyLater app
    event.waitUntil(
      clients.openWindow('/?reminder=' + (event.notification.data?.reminderId || ''))
    );
  } else if (event.action === 'snooze') {
    // Handle snooze action (could send to API)
    console.log('Snooze action clicked');
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/?reminder=' + (event.notification.data?.reminderId || ''))
    );
  }
});
