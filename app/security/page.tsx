import { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Lock, Key, Server, Users, AlertTriangle, CheckCircle, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Security & Data Protection | DueSync',
  description: 'DueSync Security Policy - Learn about our comprehensive security measures, data encryption, and privacy protection standards.',
  keywords: ['security policy', 'data protection', 'encryption', 'privacy', 'security measures', 'data security'],
  openGraph: {
    title: 'Security & Data Protection - DueSync',
    description: 'Comprehensive security measures and data protection standards at DueSync.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function SecurityPolicyPage() {
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
            Security Policy
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Last Updated: December 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8 space-y-6">

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  Our Commitment to Security
                </h2>
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                At DueSync, security is our top priority. We are committed to protecting your data and maintaining
                the highest security standards. This policy outlines the measures we take to keep your information
                safe and secure.
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                We employ industry-standard security practices and continuously monitor and improve our security
                posture to protect against evolving threats.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  1. Data Security
                </h2>
              </div>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                Encryption
              </h3>
              <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
                <li>
                  <strong>Data in Transit</strong>: All data transmitted between your browser and our servers
                  is encrypted using TLS 1.2+ (Transport Layer Security). This ensures that your data cannot
                  be intercepted or read by unauthorized parties.
                </li>
                <li>
                  <strong>Data at Rest</strong>: Your data is stored in encrypted PostgreSQL databases hosted
                  on Supabase's secure infrastructure with automatic encryption at rest.
                </li>
                <li>
                  <strong>Session Security</strong>: User sessions are protected with HTTP-only secure cookies
                  that cannot be accessed by JavaScript, preventing XSS attacks.
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                Authentication & Access Control
              </h3>
              <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
                <li>
                  <strong>Google OAuth 2.0</strong>: We use Google's industry-standard OAuth 2.0 protocol for
                  authentication. We never see or store your Google password.
                </li>
                <li>
                  <strong>Multi-Factor Authentication</strong>: Your account is protected by Google's security
                  features, including 2FA if you've enabled it on your Google account.
                </li>
                <li>
                  <strong>Session Management</strong>: Sessions expire automatically after periods of inactivity
                  to protect your account on shared devices.
                </li>
                <li>
                  <strong>Access Tokens</strong>: Google Calendar access tokens are securely stored and encrypted,
                  with automatic refresh mechanisms to maintain security.
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                Authorization & Data Isolation
              </h3>
              <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
                <li>
                  <strong>Row-Level Security</strong>: Your data is strictly isolated from other users using
                  database-level security policies.
                </li>
                <li>
                  <strong>API Authentication</strong>: Every API request is authenticated and authorized to ensure
                  you can only access your own data.
                </li>
                <li>
                  <strong>Principle of Least Privilege</strong>: We only request the minimum permissions needed
                  from Google (email, profile, calendar access).
                </li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Server className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  2. Application Security
                </h2>
              </div>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                Input Validation & Sanitization
              </h3>
              <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
                <li>
                  <strong>Schema Validation</strong>: All user inputs are validated using Zod schemas to ensure
                  data integrity and prevent malformed data.
                </li>
                <li>
                  <strong>SQL Injection Prevention</strong>: We use Prisma ORM, which automatically prevents
                  SQL injection attacks through parameterized queries.
                </li>
                <li>
                  <strong>XSS Protection</strong>: React automatically escapes all user-generated content, preventing
                  cross-site scripting (XSS) attacks.
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                CSRF Protection
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                NextAuth provides built-in CSRF (Cross-Site Request Forgery) protection for all state-changing
                operations. Each form submission includes a unique CSRF token that validates the request's authenticity.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                Rate Limiting
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mb-2">
                To prevent abuse and protect our services, we implement rate limiting on all API endpoints:
              </p>
              <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
                <li><strong>General API</strong>: 100 requests per minute per IP address</li>
                <li><strong>Authentication</strong>: 5 login attempts per 15 minutes</li>
                <li><strong>Calendar Sync</strong>: 50 requests per hour</li>
                <li><strong>Push Notifications</strong>: 10 requests per hour</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                Security Headers
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mb-2">
                We implement comprehensive security headers to protect against common web vulnerabilities:
              </p>
              <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
                <li><strong>Content Security Policy (CSP)</strong>: Prevents unauthorized script execution</li>
                <li><strong>X-Frame-Options: DENY</strong>: Prevents clickjacking attacks</li>
                <li><strong>X-Content-Type-Options: nosniff</strong>: Prevents MIME-type sniffing</li>
                <li><strong>Strict-Transport-Security (HSTS)</strong>: Enforces HTTPS connections</li>
                <li><strong>Referrer-Policy</strong>: Controls information sharing with third parties</li>
                <li><strong>Permissions-Policy</strong>: Restricts browser features (camera, microphone, etc.)</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Key className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  3. Third-Party Security
                </h2>
              </div>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                Google Services
              </h3>
              <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
                <li>
                  <strong>OAuth 2.0 Integration</strong>: We use Google's secure OAuth 2.0 protocol for authentication
                  and authorization.
                </li>
                <li>
                  <strong>Calendar API</strong>: Access to your Google Calendar is limited to the specific permissions
                  you grant. You can revoke access at any time through your Google account settings.
                </li>
                <li>
                  <strong>Token Management</strong>: Access tokens are automatically refreshed and securely stored.
                  We never share your tokens with third parties.
                </li>
                <li>
                  <strong>Limited Scope</strong>: We only request access to your email, profile, and calendar -
                  nothing more.
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                Infrastructure Partners
              </h3>
              <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
                <li>
                  <strong>Supabase (Database)</strong>: Our database is hosted on Supabase's SOC 2 Type II certified
                  infrastructure with automatic backups and point-in-time recovery.
                </li>
                <li>
                  <strong>Vercel (Hosting)</strong>: Our application is deployed on Vercel's secure edge network
                  with automatic HTTPS and DDoS protection.
                </li>
                <li>
                  <strong>Email Service (Resend)</strong>: Transactional emails are sent via Resend with SMTP
                  over TLS encryption.
                </li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  4. Your Security Responsibilities
                </h2>
              </div>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                Account Security Best Practices
              </h3>
              <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
                <li>
                  <strong>Strong Password</strong>: Use a strong, unique password for your Google account that
                  you use to sign in to DueSync.
                </li>
                <li>
                  <strong>Enable 2FA</strong>: Enable two-factor authentication on your Google account for an
                  extra layer of security.
                </li>
                <li>
                  <strong>Sign Out on Shared Devices</strong>: Always sign out when using DueSync on shared or
                  public computers.
                </li>
                <li>
                  <strong>Review Connected Apps</strong>: Periodically review connected applications in your
                  Google account settings.
                </li>
                <li>
                  <strong>Monitor Account Activity</strong>: Check your Google account's recent activity regularly
                  for any suspicious sign-ins.
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                General Security Tips
              </h3>
              <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
                <li>
                  <strong>Verify URLs</strong>: Always verify you're on the correct DueSync domain before signing in.
                </li>
                <li>
                  <strong>Keep Software Updated</strong>: Keep your browser and operating system up to date with
                  the latest security patches.
                </li>
                <li>
                  <strong>Use Secure Networks</strong>: Avoid accessing sensitive information on public Wi-Fi
                  networks without a VPN.
                </li>
                <li>
                  <strong>Be Wary of Phishing</strong>: We will never ask for your password via email. Be cautious
                  of suspicious emails claiming to be from DueSync.
                </li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  5. Incident Response
                </h2>
              </div>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                Security Monitoring
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                We continuously monitor our systems for security threats and suspicious activity. Our monitoring includes:
              </p>
              <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
                <li>Automated error tracking and alerting</li>
                <li>Suspicious login attempt detection</li>
                <li>API abuse monitoring</li>
                <li>Database query performance and anomaly detection</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                Breach Notification
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                In the unlikely event of a data breach that affects your personal information, we will:
              </p>
              <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
                <li>Notify affected users within 72 hours of discovering the breach</li>
                <li>Provide details about what information was affected</li>
                <li>Explain the steps we're taking to address the breach</li>
                <li>Recommend actions you should take to protect yourself</li>
                <li>Notify relevant regulatory authorities as required by law</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                Vulnerability Disclosure
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mb-2">
                We welcome reports from security researchers who discover vulnerabilities in our system.
                If you find a security issue, please report it responsibly:
              </p>
              <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
                <p className="text-slate-700 dark:text-slate-300 mb-2">
                  <strong>Security Contact</strong>: security@wiktechnologies.com
                </p>
                <p className="text-slate-700 dark:text-slate-300 mb-2">
                  <strong>Response Time</strong>: We aim to respond within 48 hours
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  Please do not disclose vulnerabilities publicly until we've had a chance to address them.
                  We follow a 90-day responsible disclosure timeline.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  6. Compliance & Certifications
                </h2>
              </div>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                Regulatory Compliance
              </h3>
              <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
                <li>
                  <strong>GDPR (General Data Protection Regulation)</strong>: We comply with GDPR requirements
                  for users in the European Union, including data portability, right to deletion, and consent management.
                </li>
                <li>
                  <strong>CCPA (California Consumer Privacy Act)</strong>: We respect the privacy rights of
                  California residents, including the right to know, delete, and opt-out of data sales.
                </li>
                <li>
                  <strong>Google API Services</strong>: We comply with Google's API Services User Data Policy,
                  including the Limited Use requirements.
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                Industry Standards
              </h3>
              <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
                <li>
                  <strong>OWASP Top 10</strong>: We follow OWASP (Open Web Application Security Project) guidelines
                  to protect against the most critical web application security risks.
                </li>
                <li>
                  <strong>Regular Security Audits</strong>: We conduct regular security audits and penetration
                  testing to identify and address vulnerabilities.
                </li>
                <li>
                  <strong>Secure Development Lifecycle</strong>: Security is integrated into every stage of our
                  development process, from design to deployment.
                </li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  7. Security Updates & Maintenance
                </h2>
              </div>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                Dependency Management
              </h3>
              <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
                <li>
                  <strong>Regular Updates</strong>: We regularly update all software dependencies to include the
                  latest security patches.
                </li>
                <li>
                  <strong>Automated Security Audits</strong>: We use automated tools to scan for known vulnerabilities
                  in our dependencies.
                </li>
                <li>
                  <strong>Rapid Patching</strong>: Critical security vulnerabilities are patched within 24-48 hours
                  of discovery.
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                Continuous Improvement
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                Security is an ongoing process. We continuously improve our security measures by:
              </p>
              <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
                <li>Monitoring the latest security threats and vulnerabilities</li>
                <li>Implementing new security technologies and best practices</li>
                <li>Learning from security incidents in our industry</li>
                <li>Gathering feedback from security researchers and users</li>
                <li>Conducting regular security training for our team</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                8. Contact Us
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                If you have any questions or concerns about our security practices, please contact us:
              </p>
              <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 space-y-2">
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>Security Issues</strong>: security@wiktechnologies.com
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>General Support</strong>: infoduesync@wiktechnologies.com
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>Response Time</strong>: We aim to respond to all security inquiries within 48 hours
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                9. Related Policies
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                For more information about how we handle your data, please review our other policies:
              </p>
              <div className="space-y-2">
                <Link
                  href="/privacy"
                  className="block text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  → Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="block text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  → Terms of Service
                </Link>
              </div>
            </section>

            <section className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                This Security Policy was last updated on December 2025. We may update this policy from time to time.
                Significant changes will be communicated to users via email or in-app notifications.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
