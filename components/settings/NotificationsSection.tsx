'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Bell, Loader2, Mail, Check, AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { WeekDay } from '@prisma/client';
import {
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getSubscription,
  subscriptionToJSON,
} from '@/lib/push';

interface NotificationPreferences {
  id: string;
  userId: string;
  dailyEmailEnabled: boolean;
  dailyEmailTime: string;
  weeklyEmailEnabled: boolean;
  weeklyEmailDay: WeekDay;
  weeklyEmailTime: string;
  pushNotificationsEnabled: boolean;
  reminderMinutesBefore: number[];
  updatedAt: string;
}

const WEEK_DAYS = [
  { value: WeekDay.MONDAY, label: 'Monday' },
  { value: WeekDay.TUESDAY, label: 'Tuesday' },
  { value: WeekDay.WEDNESDAY, label: 'Wednesday' },
  { value: WeekDay.THURSDAY, label: 'Thursday' },
  { value: WeekDay.FRIDAY, label: 'Friday' },
  { value: WeekDay.SATURDAY, label: 'Saturday' },
  { value: WeekDay.SUNDAY, label: 'Sunday' },
];

export function NotificationsSection() {
  const queryClient = useQueryClient();

  // Local state for form
  const [dailyEnabled, setDailyEnabled] = useState(true);
  const [dailyTime, setDailyTime] = useState('08:00');
  const [weeklyEnabled, setWeeklyEnabled] = useState(true);
  const [weeklyDay, setWeeklyDay] = useState<WeekDay>(WeekDay.MONDAY);
  const [weeklyTime, setWeeklyTime] = useState('09:00');

  // Push notification state
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [pushSubscription, setPushSubscription] = useState<PushSubscription | null>(null);
  const [pushLoading, setPushLoading] = useState(false);
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

  // Fetch preferences
  const { data, isLoading } = useQuery({
    queryKey: ['notificationPreferences'],
    queryFn: async () => {
      const res = await fetch('/api/notifications/preferences');
      if (!res.ok) throw new Error('Failed to fetch preferences');
      const data = await res.json();
      return data.preferences as NotificationPreferences;
    },
  });

  // Update form when data loads
  useEffect(() => {
    if (data) {
      setDailyEnabled(data.dailyEmailEnabled);
      setDailyTime(data.dailyEmailTime);
      setWeeklyEnabled(data.weeklyEmailEnabled);
      setWeeklyDay(data.weeklyEmailDay);
      setWeeklyTime(data.weeklyEmailTime);
    }
  }, [data]);

  // Check push notification support and status on mount
  useEffect(() => {
    setPushSupported(isPushSupported());
    setPushPermission(getNotificationPermission());
    loadPushSubscription();
  }, []);

  const loadPushSubscription = async () => {
    const sub = await getSubscription();
    setPushSubscription(sub);
  };

  // Update preferences mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      const res = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update preferences');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
      toast.success('Preferences updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update preferences');
    },
  });

  // Send test email mutation
  const testEmailMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notifications/preferences', {
        method: 'POST',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to send test email');
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Test email sent successfully! Check your inbox.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send test email');
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      dailyEmailEnabled: dailyEnabled,
      dailyEmailTime: dailyTime,
      weeklyEmailEnabled: weeklyEnabled,
      weeklyEmailDay: weeklyDay,
      weeklyEmailTime: weeklyTime,
    });
  };

  const handleTestEmail = () => {
    testEmailMutation.mutate();
  };

  // Push notification handlers
  const handleRequestPermission = async () => {
    try {
      setPushLoading(true);
      const perm = await requestNotificationPermission();
      setPushPermission(perm);
      if (perm === 'granted') {
        toast.success('Notification permission granted!');
      } else {
        toast.error('Notification permission denied');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to request permission');
    } finally {
      setPushLoading(false);
    }
  };

  const handleSubscribePush = async () => {
    try {
      setPushLoading(true);

      if (!vapidKey) {
        toast.error('Push notifications not configured');
        return;
      }

      const sub = await subscribeToPush(vapidKey);
      setPushSubscription(sub);

      const response = await fetch('/api/notifications/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionToJSON(sub)),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }

      queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
      toast.success('Push notifications enabled!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to enable push notifications');
    } finally {
      setPushLoading(false);
    }
  };

  const handleUnsubscribePush = async () => {
    try {
      setPushLoading(true);

      const success = await unsubscribeFromPush();

      if (success) {
        const response = await fetch('/api/notifications/push/unsubscribe', {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to remove subscription');
        }

        setPushSubscription(null);
        queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
        toast.success('Push notifications disabled');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to disable push notifications');
    } finally {
      setPushLoading(false);
    }
  };

  const handleTestPush = async () => {
    try {
      setPushLoading(true);

      const response = await fetch('/api/notifications/push/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Test from notification settings' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test notification');
      }

      toast.success('Test notification sent! Check your notifications.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send test notification');
    } finally {
      setPushLoading(false);
    }
  };

  return (
    <Card data-tour="notifications">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <CardTitle>Notification Preferences</CardTitle>
        </div>
        <CardDescription>
          Manage your email and push notification settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 dark:text-gray-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Daily Email */}
            <div className="space-y-4 pb-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="daily-email" className="text-base font-semibold">
                    Daily Email Summary
                  </Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Get a summary of your tasks every morning
                  </p>
                </div>
                <Switch
                  id="daily-email"
                  checked={dailyEnabled}
                  onCheckedChange={setDailyEnabled}
                />
              </div>

              {dailyEnabled && (
                <div>
                  <Label htmlFor="daily-time">Send at</Label>
                  <Input
                    id="daily-time"
                    type="time"
                    value={dailyTime}
                    onChange={(e) => setDailyTime(e.target.value)}
                    className="max-w-[150px]"
                  />
                </div>
              )}
            </div>

            {/* Weekly Email */}
            <div className="space-y-4 pb-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-email" className="text-base font-semibold">
                    Weekly Summary
                  </Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Get a weekly recap of your productivity
                  </p>
                </div>
                <Switch
                  id="weekly-email"
                  checked={weeklyEnabled}
                  onCheckedChange={setWeeklyEnabled}
                />
              </div>

              {weeklyEnabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weekly-day">Day</Label>
                    <Select value={weeklyDay} onValueChange={(value) => setWeeklyDay(value as WeekDay)}>
                      <SelectTrigger id="weekly-day">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WEEK_DAYS.map((day) => (
                          <SelectItem key={day.value} value={day.value}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="weekly-time">Time</Label>
                    <Input
                      id="weekly-time"
                      type="time"
                      value={weeklyTime}
                      onChange={(e) => setWeeklyTime(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Push Notifications */}
            <div className="space-y-4 pb-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">
                    Push Notifications
                  </Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Get instant browser notifications for task reminders
                  </p>
                </div>
              </div>

              {!pushSupported ? (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Your browser doesn't support push notifications. Try Chrome, Firefox, or Safari 16.1+
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Permission:</span>
                    {pushPermission === 'granted' ? (
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="font-medium">Granted</span>
                      </div>
                    ) : pushPermission === 'denied' ? (
                      <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-medium">Denied</span>
                      </div>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400">Not requested</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Status:</span>
                    {pushSubscription ? (
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="font-medium">Active</span>
                      </div>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400">Not subscribed</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {pushPermission === 'default' && (
                      <Button
                        onClick={handleRequestPermission}
                        disabled={pushLoading}
                        size="sm"
                        variant="outline"
                        className="w-full"
                      >
                        {pushLoading ? (
                          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        ) : (
                          <Bell className="h-3 w-3 mr-2" />
                        )}
                        Request Permission
                      </Button>
                    )}

                    {pushPermission === 'granted' && !pushSubscription && (
                      <Button
                        onClick={handleSubscribePush}
                        disabled={pushLoading}
                        size="sm"
                        className="w-full"
                      >
                        {pushLoading ? (
                          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        ) : (
                          <Bell className="h-3 w-3 mr-2" />
                        )}
                        Enable Push Notifications
                      </Button>
                    )}

                    {pushSubscription && (
                      <>
                        <Button
                          onClick={handleTestPush}
                          disabled={pushLoading}
                          size="sm"
                          variant="outline"
                          className="w-full"
                        >
                          {pushLoading ? (
                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                          ) : (
                            <Send className="h-3 w-3 mr-2" />
                          )}
                          Send Test Notification
                        </Button>
                        <Button
                          onClick={handleUnsubscribePush}
                          disabled={pushLoading}
                          size="sm"
                          variant="destructive"
                          className="w-full"
                        >
                          {pushLoading ? (
                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                          ) : null}
                          Disable Push Notifications
                        </Button>
                      </>
                    )}

                    {pushPermission === 'denied' && (
                      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          You've blocked notifications. To enable them, click the lock icon in your browser's address bar and allow notifications.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Test Email */}
            <div className="bg-indigo-50 dark:bg-indigo-950 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100 mb-2">
                    Test Your Email Configuration
                  </p>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300 mb-3">
                    Send a test email to verify your email settings are working correctly
                  </p>
                  <Button
                    onClick={handleTestEmail}
                    disabled={testEmailMutation.isPending}
                    size="sm"
                    variant="outline"
                    className="bg-white dark:bg-slate-800"
                  >
                    {testEmailMutation.isPending ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="h-3 w-3 mr-2" />
                        Send Test Email
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end pt-4">
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Save Preferences
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
