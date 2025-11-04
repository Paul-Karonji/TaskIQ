import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | DueSync',
  description: 'DueSync Terms of Service - Legal agreement for using our service',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-indigo-600 dark:text-indigo-400 hover:underline mb-4 inline-block"
          >
            ← Back to DueSync
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Terms of Service
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
                1. Acceptance of Terms
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                Welcome to DueSync. By accessing or using DueSync ("Service"), you agree to be bound by these
                Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                These Terms constitute a legally binding agreement between you and DueSync. Please read them carefully.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                2. Description of Service
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                DueSync is a web-based task management application that provides:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Task creation, organization, and tracking</li>
                <li>Google Calendar integration for task synchronization</li>
                <li>Email and push notifications</li>
                <li>Focus Mode with Pomodoro timer</li>
                <li>Recurring tasks and task archiving</li>
                <li>Categories and tags for organization</li>
                <li>Additional features as described in our documentation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                3. User Accounts
              </h2>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                3.1 Account Creation
              </h3>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>You must have a valid Google account to use DueSync</li>
                <li>You must be at least 13 years old to create an account</li>
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining account security</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                3.2 Account Security
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Maintaining the confidentiality of your Google account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access</li>
                <li>Ensuring your Google account has appropriate security measures (2FA recommended)</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                3.3 Account Termination
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                We reserve the right to suspend or terminate accounts that:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Violate these Terms</li>
                <li>Engage in fraudulent or illegal activities</li>
                <li>Abuse the Service or harm other users</li>
                <li>Remain inactive for extended periods</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300">
                You may delete your account at any time through Settings → Data & Privacy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                4. User Responsibilities
              </h2>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                4.1 Acceptable Use
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                You agree to use DueSync only for lawful purposes and in accordance with these Terms. You agree NOT to:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe intellectual property rights</li>
                <li>Upload malicious code, viruses, or harmful content</li>
                <li>Attempt to gain unauthorized access to systems</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Use automated scripts or bots (except documented APIs)</li>
                <li>Impersonate others or misrepresent your affiliation</li>
                <li>Collect user data without consent</li>
                <li>Spam, harass, or abuse other users</li>
                <li>Reverse engineer or attempt to extract source code</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                4.2 Prohibited Content
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                You may not store or transmit content that:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Is illegal, harmful, or offensive</li>
                <li>Contains malware or harmful code</li>
                <li>Infringes intellectual property rights</li>
                <li>Violates privacy or data protection laws</li>
                <li>Promotes illegal activities</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                4.3 API and Rate Limits
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                To ensure fair use, service stability, and security, we enforce rate limits on API
                requests, authentication attempts, calendar synchronization, push notifications, and
                other service features.
              </p>
              <p className="text-slate-700 dark:text-slate-300 mt-4">
                Rate limits vary by feature and may be adjusted at our discretion. Exceeding these
                limits may result in throttling, temporary suspension, or account termination.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                5. Intellectual Property
              </h2>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                5.1 Your Content
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                You retain all rights to the content you create in TaskIQ (tasks, descriptions, etc.).
                By using the Service, you grant us a limited license to:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Store and display your content</li>
                <li>Sync your content with Google Calendar (if enabled)</li>
                <li>Send you notifications containing your content</li>
                <li>Backup your content for disaster recovery</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300">
                This license ends when you delete your content or account.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                5.2 Our Intellectual Property
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                DueSync and its original content, features, and functionality are owned by DueSync and protected by:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Copyright laws</li>
                <li>Trademark laws</li>
                <li>Other intellectual property rights</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300">
                You may not copy, modify, distribute, or reverse engineer the Service without permission.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                5.3 Trademarks
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                "DueSync" and our logo are trademarks. You may not use them without our written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                6. Service Availability
              </h2>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                6.1 Uptime and Maintenance
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                We strive to provide reliable service, but we do not guarantee:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>100% uptime or availability</li>
                <li>Uninterrupted access to the Service</li>
                <li>Error-free operation</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300">
                We may perform maintenance with or without notice. We'll try to minimize disruption.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                6.2 Service Modifications
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                We reserve the right to:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Modify or discontinue features</li>
                <li>Change the Service at any time</li>
                <li>Add or remove integrations</li>
                <li>Update pricing (with notice)</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300">
                We'll provide reasonable notice for significant changes.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                6.3 Third-Party Services
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                DueSync integrates with third-party services (Google Calendar, etc.). We are not responsible for:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Third-party service availability or changes</li>
                <li>Third-party data practices or security</li>
                <li>Loss of functionality due to third-party changes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                7. Limitation of Liability
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>DueSync is provided "AS IS" without warranties of any kind</li>
                <li>We are not liable for indirect, incidental, or consequential damages</li>
                <li>We are not liable for loss of data, profits, or business opportunities</li>
                <li>Our total liability is limited to the amount you paid (if any) in the past 12 months</li>
                <li>We are not responsible for third-party actions or services</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300">
                Some jurisdictions do not allow limitation of liability, so these limits may not apply to you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                8. Indemnification
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                You agree to indemnify and hold harmless DueSync from any claims, damages, losses, or expenses
                (including legal fees) arising from:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of others</li>
                <li>Your content or conduct</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                9. Dispute Resolution
              </h2>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                9.1 Informal Resolution
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                If you have a dispute, please contact us first at infoduesync@wiktechnologies.com.
                We'll try to resolve it informally within 30 days.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                9.2 Governing Law
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law principles.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                9.3 Arbitration
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                If informal resolution fails, disputes will be resolved through binding arbitration
                in accordance with [Arbitration Rules], except as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                10. Privacy
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                Your privacy is important to us. Please review our{' '}
                <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                  Privacy Policy
                </Link>{' '}
                to understand how we collect, use, and protect your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                11. Changes to Terms
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                We may update these Terms from time to time. Changes will be posted on this page with an
                updated "Last Updated" date. Material changes will be communicated via:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Email notification</li>
                <li>Prominent notice in the app</li>
                <li>Banner on the website</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300">
                Continued use of DueSync after changes constitutes acceptance of the updated Terms.
                If you don't agree, you must stop using the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                12. Termination
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                Either party may terminate this agreement:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li><strong>You</strong>: Delete your account at any time</li>
                <li><strong>Us</strong>: Suspend or terminate accounts that violate these Terms</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300">
                Upon termination:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Your right to use the Service ends immediately</li>
                <li>Your data will be deleted according to our Privacy Policy</li>
                <li>Provisions that should survive termination (indemnification, liability, etc.) remain in effect</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                13. Miscellaneous
              </h2>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                13.1 Entire Agreement
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and DueSync.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                13.2 Severability
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                If any provision is found invalid, the remaining provisions remain in full effect.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                13.3 Waiver
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                Our failure to enforce any right doesn't waive that right.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                13.4 Assignment
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                You may not assign these Terms. We may assign them without notice.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                13.5 Force Majeure
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                We're not liable for delays or failures due to circumstances beyond our reasonable control
                (natural disasters, pandemics, war, etc.).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                14. Contact Us
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                Questions about these Terms?
              </p>
              <ul className="list-none space-y-2 text-slate-700 dark:text-slate-300">
                <li><strong>Email</strong>: infoduesync@wiktechnologies.com</li>
                <li><strong>Support</strong>: infoduesync@wiktechnologies.com</li>
                <li><strong>Response Time</strong>: Within 48 hours</li>
              </ul>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          <p>
            By using DueSync, you agree to these Terms and our{' '}
            <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
