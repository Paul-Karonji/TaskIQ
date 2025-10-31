'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Bell, Link as LinkIcon, ShieldCheck } from 'lucide-react';
import { ProfileSection } from './ProfileSection';
import { NotificationsSection } from './NotificationsSection';
import { AccountsSection } from './AccountsSection';
import { LegalSection } from './LegalSection';

interface SettingsLayoutProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    timezone: string;
    createdAt: string;
  };
  googleAccount: {
    email: string;
    connected: boolean;
    accessToken: boolean;
    expiresAt: number | null;
  } | null;
}

export function SettingsLayout({ user, googleAccount }: SettingsLayoutProps) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Profile</span>
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <span className="hidden sm:inline">Notifications</span>
        </TabsTrigger>
        <TabsTrigger value="accounts" className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Accounts</span>
        </TabsTrigger>
        <TabsTrigger value="legal" className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          <span className="hidden sm:inline">Legal & Privacy</span>
        </TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="profile" className="space-y-6">
          <ProfileSection user={user} />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationsSection />
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <AccountsSection user={user} googleAccount={googleAccount} />
        </TabsContent>

        <TabsContent value="legal" className="space-y-6">
          <LegalSection user={user} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
