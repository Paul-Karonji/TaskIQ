'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Bell, Loader2, Mail, Check } from 'lucide-react';
import { toast } from 'sonner';
import { WeekDay } from '@prisma/client';

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

export function NotificationPreferences() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Local state for form
  const [dailyEnabled, setDailyEnabled] = useState(true);
  const [dailyTime, setDailyTime] = useState('08:00');
  const [weeklyEnabled, setWeeklyEnabled] = useState(true);
  const [weeklyDay, setWeeklyDay] = useState<WeekDay>(WeekDay.MONDAY);
  const [weeklyTime, setWeeklyTime] = useState('09:00');

  // Fetch preferences
  const { data, isLoading } = useQuery({
    queryKey: ['notificationPreferences'],
    queryFn: async () => {
      const res = await fetch('/api/notifications/preferences');
      if (!res.ok) throw new Error('Failed to fetch preferences');
      const data = await res.json();
      return data.preferences as NotificationPreferences;
    },
    enabled: isOpen,
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Bell className="h-4 w-4 mr-2" />
          Notifications
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </DialogTitle>
          <DialogDescription>
            Manage your email notification settings
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-6 pt-4">
            {/* Daily Email */}
            <div className="space-y-4 pb-4 border-b">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="daily-email" className="text-base font-semibold">
                    Daily Email Summary
                  </Label>
                  <p className="text-sm text-gray-500">
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
            <div className="space-y-4 pb-4 border-b">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-email" className="text-base font-semibold">
                    Weekly Summary
                  </Label>
                  <p className="text-sm text-gray-500">
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

            {/* Test Email */}
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Test Your Email Configuration
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                    Send a test email to verify your email settings are working correctly
                  </p>
                  <Button
                    onClick={handleTestEmail}
                    disabled={testEmailMutation.isPending}
                    size="sm"
                    variant="outline"
                    className="bg-white dark:bg-gray-800"
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

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
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
      </DialogContent>
    </Dialog>
  );
}
