# Security Policy

## Overview

TaskIQ takes the security of our users' data seriously. This document outlines our security practices, how to report vulnerabilities, and what to expect from the TaskIQ security team.

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Features

### Data Protection

- **Encryption in Transit**: All data transmitted between your browser and our servers is encrypted using TLS 1.2+
- **Secure Authentication**: Google OAuth 2.0 with NextAuth v5
- **Session Management**: HTTP-only cookies with secure flags
- **Database Security**:
  - PostgreSQL with Prisma ORM (SQL injection prevention)
  - Row-Level Security (RLS) enabled on all user data tables
  - Defense-in-depth protection at database layer
  - See `docs/RLS_IMPLEMENTATION.md` for technical details

### Application Security

- **Content Security Policy**: Strict CSP headers to prevent XSS attacks
- **CSRF Protection**: Built into NextAuth for all state-changing operations
- **Rate Limiting**: API endpoints are rate-limited to prevent abuse:
  - General API: 100 requests/minute
  - Authentication: 5 attempts/15 minutes
  - Calendar Sync: 50 requests/hour
  - Push Notifications: 10 requests/hour
- **Input Validation**: All user inputs validated using Zod schemas
- **XSS Prevention**: React escapes all user-generated content automatically

### Security Headers

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: [detailed policy]
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Reporting a Vulnerability

We appreciate the security community's efforts in keeping TaskIQ safe. If you discover a security vulnerability, please follow these guidelines:

### Where to Report

**Email**: security@wiktechnologies.com

**Do NOT**:
- Open a public GitHub issue for security vulnerabilities
- Disclose the vulnerability publicly before it's fixed
- Exploit the vulnerability for any purpose other than verification

### What to Include

Please provide:

1. **Description**: Clear description of the vulnerability
2. **Type**: Category (XSS, SQL injection, CSRF, etc.)
3. **Location**: URL, file path, or API endpoint affected
4. **Steps to Reproduce**: Detailed steps to reproduce the issue
5. **Impact**: Potential impact and severity assessment
6. **Proof of Concept**: Code or screenshots demonstrating the issue
7. **Suggested Fix**: If you have ideas for fixing the issue (optional)
8. **Your Contact Information**: For follow-up questions

### What to Expect

- **Acknowledgment**: Within 48 hours of your report
- **Initial Assessment**: Within 5 business days
- **Status Updates**: Every 7 days until resolution
- **Fix Timeline**:
  - Critical: 1-7 days
  - High: 7-30 days
  - Medium: 30-90 days
  - Low: 90+ days or next release
- **Credit**: Public acknowledgment in our security changelog (if desired)

### Responsible Disclosure

We follow a 90-day disclosure timeline:
1. Vulnerability reported and acknowledged
2. Fix developed and tested
3. Patch released to production
4. Public disclosure (after 90 days or once patch is widely deployed)

## Security Best Practices for Users

### For Regular Users

1. **Strong Passwords**: Use a strong, unique password for your Google account
2. **Two-Factor Authentication**: Enable 2FA on your Google account
3. **Verify URLs**: Always verify you're on the correct TaskIQ domain
4. **Logout**: Sign out when using shared computers
5. **Permissions**: Review Google Calendar permissions granted to TaskIQ

### For Self-Hosted Deployments

1. **Environment Variables**: Never commit `.env` files to version control
2. **Database Security**: Use strong database passwords and restrict access
3. **HTTPS**: Always use HTTPS in production
4. **Regular Updates**: Keep dependencies updated with `npm audit`
5. **Backup**: Regular database backups with encryption
6. **Monitoring**: Set up error monitoring (Sentry) and log analysis
7. **Secrets Rotation**: Rotate API keys and secrets regularly

## Security Checklist for Development

- [ ] All user inputs validated with Zod
- [ ] No sensitive data in logs
- [ ] Authentication required for protected routes
- [ ] User data access verified (no unauthorized access)
- [ ] SQL queries use Prisma (parameterized)
- [ ] No eval() or dangerouslySetInnerHTML without sanitization
- [ ] Third-party dependencies audited
- [ ] Environment variables used for secrets
- [ ] HTTPS enforced in production
- [ ] Security headers configured
- [ ] Rate limiting applied to APIs
- [ ] CSRF tokens for state-changing operations
- [ ] Session timeout configured
- [ ] Error messages don't leak sensitive info

## Dependencies Security

We regularly audit our dependencies:

```bash
npm audit
npm audit fix
npm outdated
```

### Known Issues

Check our [GitHub Security Advisories](https://github.com/yourusername/taskiq/security/advisories) for known vulnerabilities and their status.

## Compliance

### Data Protection

- **GDPR**: Users can export and delete their data
- **CCPA**: California users have data rights
- **Data Retention**: Task data retained while account is active
- **Data Deletion**: All user data deleted within 30 days of account deletion

### Third-Party Services

We use the following third-party services:

1. **Google OAuth & Calendar API**
   - Purpose: Authentication and calendar synchronization
   - Data shared: Email, name, profile picture, calendar events
   - Privacy Policy: https://policies.google.com/privacy

2. **Supabase (PostgreSQL)**
   - Purpose: Database hosting
   - Data stored: All user and task data
   - Security: TLS encryption, regular backups

3. **Vercel** (if deployed)
   - Purpose: Application hosting
   - Data: Server logs, analytics
   - Privacy Policy: https://vercel.com/legal/privacy-policy

## Security Contact

For security-related inquiries:

- **Email**: security@wiktechnologies.com
- **Response Time**: Within 48 hours
- **PGP Key**: Available upon request

For general support:
- **Email**: support@wiktechnologies.com
- **GitHub Issues**: For non-security bugs

## Acknowledgments

We thank the following researchers for responsibly disclosing vulnerabilities:

- [Name] - [Vulnerability] - [Date]

## Changes to This Policy

This security policy may be updated from time to time. We will notify users of significant changes via:
- Email to registered users
- Notice on our website
- GitHub commit history

**Last Updated**: November 2, 2025

---

## Security Audit History

| Date | Auditor | Scope | Findings | Status |
|------|---------|-------|----------|--------|
| TBD  | Internal | Full App | TBD | Pending |

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)
