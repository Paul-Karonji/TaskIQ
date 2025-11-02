'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, FileText, Download, Loader2, ExternalLink, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface LegalSectionProps {
  user: {
    id: string;
    email: string;
  };
}

export function LegalSection({ user }: LegalSectionProps) {
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  const handleExportData = async () => {
    try {
      setExporting(true);
      const response = await fetch('/api/user/export');

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const data = await response.json();

      // Create a downloadable JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `taskiq-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Privacy & Legal Documents Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            <CardTitle>Privacy & Legal</CardTitle>
          </div>
          <CardDescription>
            Review our policies and terms of service
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {/* Privacy Policy */}
            <Link
              href="/privacy"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Privacy Policy</p>
                  <p className="text-xs text-gray-500">
                    How we collect, use, and protect your data
                  </p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </Link>

            {/* Terms of Service */}
            <Link
              href="/terms"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Terms of Service</p>
                  <p className="text-xs text-gray-500">
                    Rules and guidelines for using DueSync
                  </p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </Link>

            {/* Security Policy */}
            <Link
              href="/security"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Security Policy</p>
                  <p className="text-xs text-gray-500">
                    How we protect your data and maintain security
                  </p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </Link>

            {/* Google API Disclosure */}
            <Link
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
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
                <div>
                  <p className="text-sm font-medium text-gray-900">Google API Disclosure</p>
                  <p className="text-xs text-gray-500">
                    How DueSync uses your Google data
                  </p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Data Rights (GDPR) Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Data Rights</CardTitle>
          <CardDescription>
            Manage and export your personal data in accordance with GDPR
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Data Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">What data do we store?</p>
            <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
              <li>Your profile information (name, email, timezone)</li>
              <li>Tasks and task history</li>
              <li>Categories and tags you create</li>
              <li>Notification preferences</li>
              <li>Google Calendar sync data</li>
            </ul>
          </div>

          <Separator />

          {/* Export Data */}
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Export Your Data</p>
              <p className="text-xs text-gray-500 mb-3">
                Download all your DueSync data in JSON format. This includes your profile, tasks,
                categories, tags, and preferences.
              </p>
            </div>

            <Button
              onClick={handleExportData}
              disabled={exporting}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {exporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data (JSON)
                </>
              )}
            </Button>
          </div>

          <Separator />

          {/* Data Retention */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900">Data Retention</p>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-700">
                <strong>Active data:</strong> Stored while your account is active
              </p>
              <p className="text-xs text-gray-700 mt-1">
                <strong>Deleted data:</strong> Permanently removed within 30 days of deletion
              </p>
              <p className="text-xs text-gray-700 mt-1">
                <strong>Backups:</strong> Retained for up to 30 days for disaster recovery
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Card */}
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <CardTitle className="text-red-900">Danger Zone</CardTitle>
          </div>
          <CardDescription className="text-red-700">
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-100 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-medium text-red-900 mb-2">⚠️ This action cannot be undone!</p>
            <ul className="text-xs text-red-800 space-y-1 list-disc list-inside">
              <li>All your tasks will be permanently deleted</li>
              <li>All categories and tags will be removed</li>
              <li>Your account data will be erased</li>
              <li>Google Calendar synced events will remain (you'll need to delete them manually)</li>
              <li>This action takes effect within 30 days</li>
            </ul>
          </div>

          {!showDeleteConfirm ? (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete My Account
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="bg-white border border-red-300 rounded-lg p-4">
                <p className="text-sm font-medium text-red-900 mb-2">
                  Are you absolutely sure?
                </p>
                <p className="text-xs text-red-700 mb-3">
                  Type <strong>"{user.email}"</strong> below to confirm account deletion:
                </p>
                <input
                  type="text"
                  id="delete-confirm"
                  placeholder="Enter your email to confirm"
                  className="w-full px-3 py-2 text-sm border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    const input = document.getElementById('delete-confirm') as HTMLInputElement;
                    if (input.value !== user.email) {
                      toast.error('Email does not match. Please type your email exactly as shown.');
                      return;
                    }

                    try {
                      setDeleting(true);
                      const response = await fetch('/api/user/delete', {
                        method: 'DELETE',
                      });

                      if (!response.ok) {
                        throw new Error('Failed to delete account');
                      }

                      toast.success('Account deleted. Redirecting...');

                      // Sign out and redirect to home
                      setTimeout(async () => {
                        await signOut({ callbackUrl: '/' });
                      }, 2000);
                    } catch (error) {
                      toast.error('Failed to delete account. Please try again or contact support.');
                      setDeleting(false);
                      setShowDeleteConfirm(false);
                    }
                  }}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Yes, Delete My Account
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact & Support Card */}
      <Card className="border-gray-200">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-gray-600">
            <p>Have questions about your data or privacy?</p>
            <Link
              href="mailto:support@taskiq.example.com"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Contact Support
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
