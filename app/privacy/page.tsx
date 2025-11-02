import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | DueSync',
  description: 'DueSync Privacy Policy - How we collect, use, and protect your data',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-indigo-600 dark:text-indigo-400 hover:underline mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Privacy Policy
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Last Updated: December 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8 space-y-6">

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Introduction
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                Welcome to DueSync. We respect your privacy and are committed to protecting your personal data.
                This privacy policy explains how we collect, use, disclose, and safeguard your information when
                you use our task management application.
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                By using DueSync, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                1. Information We Collect
              </h2>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                1.1 Information You Provide
              </h3>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li><strong>Google Account Information</strong>: When you sign in with Google, we receive your name, email address, and profile picture</li>
                <li><strong>Task Data</strong>: Task titles, descriptions, due dates, times, priorities, categories, tags, and completion status</li>
                <li><strong>Preferences</strong>: Notification settings, theme preferences, time zone</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                1.2 Automatically Collected Information
              </h3>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li><strong>Usage Data</strong>: Pages visited, features used, time spent, actions taken</li>
                <li><strong>Device Information</strong>: Browser type, device type, operating system, IP address</li>
                <li><strong>Cookies</strong>: Session cookies for authentication, preference cookies for theme</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                1.3 Google Calendar Integration
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                If you enable Google Calendar sync, we access your Google Calendar to:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Create calendar events for synced tasks</li>
                <li>Update events when tasks change</li>
                <li>Delete events when tasks are unsynced</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300">
                We do not read, modify, or delete calendar events we didn't create.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                2. How We Use Your Information
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li><strong>Provide Services</strong>: Create, store, and manage your tasks</li>
                <li><strong>Calendar Sync</strong>: Synchronize tasks with your Google Calendar</li>
                <li><strong>Notifications</strong>: Send email and push notifications based on your preferences</li>
                <li><strong>Authentication</strong>: Verify your identity and maintain your session</li>
                <li><strong>Improve Services</strong>: Analyze usage patterns to enhance features</li>
                <li><strong>Security</strong>: Detect and prevent fraud, abuse, and security incidents</li>
                <li><strong>Communication</strong>: Send important service updates and announcements</li>
                <li><strong>Compliance</strong>: Meet legal obligations and enforce our terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                3. Data Storage and Security
              </h2>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                3.1 Data Storage
              </h3>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li><strong>Database</strong>: Your data is stored in a secure PostgreSQL database hosted by Supabase</li>
                <li><strong>Location</strong>: Data centers in AWS regions (configurable)</li>
                <li><strong>Backups</strong>: Regular automated backups for data recovery</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                3.2 Security Measures
              </h3>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li><strong>Encryption in Transit</strong>: All data transmitted over HTTPS/TLS 1.2+</li>
                <li><strong>Authentication</strong>: Secure Google OAuth 2.0</li>
                <li><strong>Session Management</strong>: HTTP-only cookies with secure flags</li>
                <li><strong>Access Controls</strong>: Role-based access and authentication checks</li>
                <li><strong>Rate Limiting</strong>: Protection against brute force attacks</li>
                <li><strong>Regular Audits</strong>: Ongoing security assessments</li>
              </ul>

              <p className="text-slate-700 dark:text-slate-300">
                While we implement robust security measures, no method of transmission over the Internet is 100% secure.
                We cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                4. Data Sharing and Disclosure
              </h2>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                4.1 We Do NOT Sell Your Data
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                We do not sell, rent, or trade your personal information to third parties for marketing purposes.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                4.2 Third-Party Services
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                We use the following trusted third-party services:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li><strong>Google OAuth & Calendar API</strong>: For authentication and calendar integration</li>
                <li><strong>Supabase</strong>: For database hosting</li>
                <li><strong>Vercel</strong>: For application hosting (if applicable)</li>
                <li><strong>Email Service</strong>: For sending notification emails</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300">
                These services have their own privacy policies and security measures.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                4.3 Legal Requirements
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                We may disclose your information if required by law or in response to:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Legal processes (subpoenas, court orders)</li>
                <li>Government requests</li>
                <li>Protection of rights, property, or safety</li>
                <li>Fraud prevention and security threats</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                5. Your Rights (GDPR & CCPA)
              </h2>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                5.1 Right to Access
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                You can view all your data in the app. To export: Settings → Data & Privacy → Export My Data
              </p>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                5.2 Right to Rectification
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                You can edit your tasks, categories, tags, and preferences anytime in the app.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                5.3 Right to Deletion
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                Settings → Data & Privacy → Delete Account. All data permanently removed within 30 days.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                5.4 Right to Portability
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                Export your data in JSON format: Settings → Data & Privacy → Export My Data
              </p>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                5.5 Right to Object
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                You can opt-out of email and push notifications in Settings → Notifications.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                5.6 California Residents (CCPA)
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                California residents have additional rights under CCPA. Contact us to exercise these rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                6. Cookies and Tracking
              </h2>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                6.1 Essential Cookies
              </h3>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li><strong>Authentication</strong>: Session cookies for login (required)</li>
                <li><strong>Security</strong>: CSRF tokens (required)</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                6.2 Preference Cookies
              </h3>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li><strong>Theme</strong>: Remember dark/light mode preference</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                6.3 Analytics Cookies (Optional)
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                If analytics are enabled, we use cookies to understand how you use DueSync. You can opt-out in Settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                7. Data Retention
              </h2>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li><strong>Active Accounts</strong>: Data retained as long as your account is active</li>
                <li><strong>Inactive Accounts</strong>: May be deleted after extended inactivity (notification sent)</li>
                <li><strong>Deleted Accounts</strong>: All data permanently deleted within 30 days</li>
                <li><strong>Backups</strong>: Backup copies may persist for up to 90 days for disaster recovery</li>
                <li><strong>Legal Holds</strong>: Data may be retained longer if required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                8. Children's Privacy
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                DueSync is not intended for children under 13 years of age. We do not knowingly collect personal
                information from children under 13. If we discover that we have collected information from a child
                under 13, we will delete it immediately.
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                If you believe a child under 13 has provided us with personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                9. International Data Transfers
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                Your data may be transferred to and processed in countries other than your country of residence.
                These countries may have different data protection laws. We ensure appropriate safeguards are in
                place to protect your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                10. Changes to This Policy
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                We may update this privacy policy from time to time. Changes will be posted on this page with an
                updated "Last Updated" date. Significant changes will be communicated via:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Email notification to registered users</li>
                <li>Prominent notice in the app</li>
                <li>Banner on the website</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300">
                Continued use of DueSync after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                11. Contact Us
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                If you have questions about this privacy policy or your data:
              </p>
              <ul className="list-none space-y-2 text-slate-700 dark:text-slate-300">
                <li><strong>Email</strong>: infoduesync@wiktechnologies.com</li>
                <li><strong>Data Protection Officer</strong>: infoduesync@wiktechnologies.com</li>
                <li><strong>Support</strong>: infoduesync@wiktechnologies.com</li>
                <li><strong>Response Time</strong>: Within 48 hours</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                12. Additional Information
              </h2>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li><strong>Security Policy</strong>: See our <Link href="/security" className="text-indigo-600 dark:text-indigo-400 hover:underline">Security Policy</Link></li>
                <li><strong>Terms of Service</strong>: See our <Link href="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">Terms of Service</Link></li>
                <li><strong>User Guide</strong>: Learn how to use DueSync in our User Guide</li>
                <li><strong>FAQ</strong>: Common questions answered in our FAQ</li>
              </ul>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          <p>
            By using DueSync, you agree to this Privacy Policy and our{' '}
            <Link href="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
