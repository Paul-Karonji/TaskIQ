'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle2, Mail, ExternalLink, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface AccountsSectionProps {
  user: {
    email: string;
  };
  googleAccount: {
    email: string;
    connected: boolean;
    accessToken: boolean;
    expiresAt: number | null;
  } | null;
}

export function AccountsSection({ user, googleAccount }: AccountsSectionProps) {
  const isTokenValid = googleAccount?.expiresAt
    ? googleAccount.expiresAt > Math.floor(Date.now() / 1000)
    : false;

  return (
    <div className="space-y-6">
      {/* Google Account Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google Account
              </CardTitle>
              <CardDescription>Manage your Google account connection</CardDescription>
            </div>
            {googleAccount?.connected ? (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="border-red-200 text-red-700">
                <AlertCircle className="h-3 w-3 mr-1" />
                Not Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email */}
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Email Address</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>

          <Separator />

          {/* Calendar Sync */}
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Google Calendar Sync</p>
              {googleAccount?.connected && googleAccount.accessToken ? (
                <div className="space-y-2 mt-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                      {isTokenValid ? 'Active' : 'Token Expired'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    Tasks can be synchronized with your Google Calendar
                  </p>
                </div>
              ) : (
                <div className="space-y-2 mt-1">
                  <Badge variant="outline">Not Enabled</Badge>
                  <p className="text-xs text-gray-500">
                    Calendar sync requires Google Calendar access permissions
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Account Management */}
          <div className="space-y-3 pt-2">
            <p className="text-sm font-medium text-gray-900">Account Management</p>

            <Link
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage Google Permissions
              </Button>
            </Link>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800">
                <strong>Note:</strong> To disconnect your Google account, you must sign out and
                revoke DueSync's access in your Google account settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Future Integrations Card */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Future Integrations</CardTitle>
          <CardDescription>
            Additional calendar and productivity tool integrations coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg opacity-50">
              <div className="h-8 w-8 rounded bg-gray-200" />
              <span className="text-sm text-gray-500">Outlook</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg opacity-50">
              <div className="h-8 w-8 rounded bg-gray-200" />
              <span className="text-sm text-gray-500">Apple Calendar</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg opacity-50">
              <div className="h-8 w-8 rounded bg-gray-200" />
              <span className="text-sm text-gray-500">Slack</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
