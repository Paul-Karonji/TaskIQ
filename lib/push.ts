// Client-side Push Notification Utilities

import { getServiceWorkerRegistration } from './register-sw';

// URL-safe base64 encoding for VAPID public key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if push notifications are supported in the browser
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported in this browser');
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('[Push] Notification permission:', permission);
    return permission;
  } catch (error) {
    console.error('[Push] Error requesting notification permission:', error);
    throw error;
  }
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(
  vapidPublicKey: string
): Promise<PushSubscription> {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported');
  }

  // Check permission
  const permission = getNotificationPermission();
  if (permission === 'denied') {
    throw new Error('Notification permission denied');
  }

  // Request permission if not granted
  if (permission !== 'granted') {
    const newPermission = await requestNotificationPermission();
    if (newPermission !== 'granted') {
      throw new Error('Notification permission not granted');
    }
  }

  // Get service worker registration
  const registration = await getServiceWorkerRegistration();
  if (!registration) {
    throw new Error('Service worker not registered');
  }

  try {
    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      console.log('[Push] Already subscribed to push notifications');
      return subscription;
    }

    // Subscribe to push
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    console.log('[Push] Successfully subscribed to push notifications');
    return subscription;
  } catch (error) {
    console.error('[Push] Error subscribing to push notifications:', error);
    throw error;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) {
    return false;
  }

  try {
    const registration = await getServiceWorkerRegistration();
    if (!registration) {
      return false;
    }

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      console.log('[Push] No active subscription to unsubscribe from');
      return false;
    }

    const success = await subscription.unsubscribe();
    console.log('[Push] Unsubscribed from push notifications:', success);
    return success;
  } catch (error) {
    console.error('[Push] Error unsubscribing from push notifications:', error);
    return false;
  }
}

/**
 * Get current push subscription
 */
export async function getSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    return null;
  }

  try {
    const registration = await getServiceWorkerRegistration();
    if (!registration) {
      return null;
    }

    const subscription = await registration.pushManager.getSubscription();
    return subscription;
  } catch (error) {
    console.error('[Push] Error getting push subscription:', error);
    return null;
  }
}

/**
 * Check if user is currently subscribed to push notifications
 */
export async function isSubscribed(): Promise<boolean> {
  const subscription = await getSubscription();
  return subscription !== null;
}

/**
 * Convert PushSubscription to JSON for storage
 */
export function subscriptionToJSON(subscription: PushSubscription): object {
  return subscription.toJSON();
}
