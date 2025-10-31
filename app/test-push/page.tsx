'use client';

import { useState, useEffect } from 'react';
import {
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getSubscription,
  subscriptionToJSON,
} from '@/lib/push';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bell,
  BellOff,
  Send,
  Key,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function TestPushPage() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [vapidKey] = useState(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '');

  // Check support and initial status
  useEffect(() => {
    setSupported(isPushSupported());
    setPermission(getNotificationPermission());
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    const sub = await getSubscription();
    setSubscription(sub);
  };

  const handleRequestPermission = async () => {
    try {
      setLoading(true);
      const perm = await requestNotificationPermission();
      setPermission(perm);
      if (perm === 'granted') {
        toast.success('Notification permission granted!');
      } else {
        toast.error('Notification permission denied');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      setLoading(true);

      if (!vapidKey) {
        toast.error('VAPID public key not found. Check environment variables.');
        return;
      }

      // Subscribe to push
      const sub = await subscribeToPush(vapidKey);
      setSubscription(sub);

      // Save to database
      const response = await fetch('/api/notifications/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionToJSON(sub)),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription to database');
      }

      toast.success('Successfully subscribed to push notifications!');
      await loadSubscription();
    } catch (error: any) {
      toast.error(`Subscription failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      setLoading(true);

      // Unsubscribe from browser
      const success = await unsubscribeFromPush();

      if (success) {
        // Remove from database
        const response = await fetch('/api/notifications/push/unsubscribe', {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to remove subscription from database');
        }

        setSubscription(null);
        toast.success('Successfully unsubscribed from push notifications');
      }
    } catch (error: any) {
      toast.error(`Unsubscribe failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/notifications/push/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: testMessage || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test notification');
      }

      toast.success('Test notification sent! Check your notifications.');
    } catch (error: any) {
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = ({ status, label }: { status: boolean; label: string }) => (
    <div className="flex items-center gap-2">
      {status ? (
        <CheckCircle2 className="h-5 w-5 text-green-600" />
      ) : (
        <XCircle className="h-5 w-5 text-red-600" />
      )}
      <span className="font-medium">{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Push Notifications Test
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Test and debug push notification functionality
          </p>
        </div>

        {/* Status Overview */}
        <Card className="p-6 mb-6 dark:bg-slate-800 dark:border-slate-700">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Current Status</h2>
          <div className="space-y-3">
            <StatusBadge status={supported} label="Browser Support" />
            <StatusBadge
              status={permission === 'granted'}
              label={`Permission: ${permission}`}
            />
            <StatusBadge status={subscription !== null} label="Push Subscription" />
          </div>
        </Card>

        {/* Actions */}
        <Card className="p-6 mb-6 dark:bg-slate-800 dark:border-slate-700">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Actions</h2>

          {!supported && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900 dark:text-red-200">
                    Browser Not Supported
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    Your browser does not support push notifications. Try Chrome, Firefox, or
                    Safari 16.1+
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {/* Request Permission */}
            <Button
              onClick={handleRequestPermission}
              disabled={!supported || permission !== 'default' || loading}
              className="w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              Request Notification Permission
            </Button>

            {/* Subscribe */}
            <Button
              onClick={handleSubscribe}
              disabled={!supported || permission !== 'granted' || subscription !== null || loading}
              variant="default"
              className="w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              Subscribe to Push Notifications
            </Button>

            {/* Unsubscribe */}
            <Button
              onClick={handleUnsubscribe}
              disabled={!supported || subscription === null || loading}
              variant="outline"
              className="w-full"
            >
              <BellOff className="h-4 w-4 mr-2" />
              Unsubscribe from Push
            </Button>

            {/* Send Test */}
            <div className="pt-4 border-t dark:border-slate-600">
              <input
                type="text"
                placeholder="Custom test message (optional)"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg mb-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
              <Button
                onClick={handleSendTest}
                disabled={!supported || subscription === null || loading}
                variant="secondary"
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Test Push Notification
              </Button>
            </div>

            {/* Refresh Status */}
            <Button
              onClick={loadSubscription}
              disabled={loading}
              variant="ghost"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
          </div>
        </Card>

        {/* Subscription Details */}
        {subscription && (
          <Card className="p-6 mb-6 dark:bg-slate-800 dark:border-slate-700">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Subscription Details</h2>
            <pre className="bg-gray-100 dark:bg-slate-900 p-4 rounded-lg overflow-x-auto text-xs">
              {JSON.stringify(subscriptionToJSON(subscription), null, 2)}
            </pre>
          </Card>
        )}

        {/* VAPID Public Key */}
        <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">VAPID Public Key</h2>
          <div className="flex items-start gap-3 bg-gray-100 dark:bg-slate-900 p-4 rounded-lg">
            <Key className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
            <code className="text-xs break-all dark:text-gray-300">
              {vapidKey || 'Not configured - check NEXT_PUBLIC_VAPID_PUBLIC_KEY'}
            </code>
          </div>
        </Card>
      </div>
    </div>
  );
}
