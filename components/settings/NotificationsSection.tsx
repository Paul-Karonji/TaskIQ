'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';

export function NotificationsSection() {
  return (
    <Card>
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
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> Notification preferences are currently managed through the
            Notifications button on the main dashboard. We're working on integrating them
            directly into this settings page.
          </p>
          <p className="text-sm text-blue-700 mt-2">
            Click the "Notifications" button in the dashboard header to manage your email
            summaries, push notifications, and reminder settings.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
