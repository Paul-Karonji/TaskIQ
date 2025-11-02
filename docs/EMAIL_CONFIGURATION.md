# Email Configuration Guide

This guide explains how to set up email notifications for DueSync using Gmail SMTP or other email providers.

## Overview

DueSync sends automated email notifications including:
- **Daily Digest**: Summary of today's pending tasks
- **Weekly Report**: Weekly productivity summary with statistics
- **Test Emails**: Manual test emails from notification preferences

## Prerequisites

- A Gmail account (or other SMTP-compatible email provider)
- Gmail App Password (for Gmail users) or SMTP credentials

## Gmail Setup (Recommended)

### Step 1: Enable 2-Step Verification

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click **2-Step Verification**
3. Follow the prompts to enable 2-Step Verification

### Step 2: Generate App Password

1. Go to [Google Account App Passwords](https://myaccount.google.com/apppasswords)
2. Select app: **Mail**
3. Select device: **Other (Custom name)** - Enter "DueSync"
4. Click **Generate**
5. Copy the 16-character app password (remove spaces)

### Step 3: Configure Environment Variables

Add the following to your `.env` file:

```env
# Email Configuration (Gmail)
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-16-char-app-password"
```

**Example:**
```env
GMAIL_USER="taskiq.notifications@gmail.com"
GMAIL_APP_PASSWORD="abcd efgh ijkl mnop"  # 16-character password from step 2
```

### Step 4: Restart Development Server

```bash
npm run dev
```

### Step 5: Test Email Delivery

1. Go to DueSync dashboard
2. Click **Notifications** button
3. Configure your preferences
4. Click **Send Test Email**
5. Check your inbox for the test email

## Other Email Providers

DueSync uses Nodemailer which supports any SMTP provider. You'll need to modify `lib/email.ts`:

### SendGrid

```typescript
// lib/email.ts
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
});
```

**Environment Variables:**
```env
SENDGRID_API_KEY="your-sendgrid-api-key"
GMAIL_USER="your-verified-sender@example.com"
```

### Outlook/Office 365

```typescript
// lib/email.ts
const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.OUTLOOK_USER,
    pass: process.env.OUTLOOK_PASSWORD,
  },
});
```

**Environment Variables:**
```env
OUTLOOK_USER="your-email@outlook.com"
OUTLOOK_PASSWORD="your-password"
GMAIL_USER="your-email@outlook.com"  # Used as "from" address
```

### AWS SES

```typescript
// lib/email.ts
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({ region: process.env.AWS_REGION });
```

**Environment Variables:**
```env
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
GMAIL_USER="verified-sender@example.com"
```

## Email Templates

DueSync includes pre-built HTML email templates:

### Daily Digest Email

- Sent based on user's configured time (default: 8:00 AM)
- Includes:
  - Today's pending tasks
  - Priority breakdown
  - Tasks grouped by category
  - Estimated total time
  - Direct link to DueSync

### Weekly Report Email

- Sent based on user's configured day and time (default: Monday 9:00 AM)
- Includes:
  - Week summary (completed, pending, overdue)
  - Productivity statistics
  - Upcoming tasks for the week
  - Weekly completion rate

### Test Email

- Sent immediately when "Send Test Email" is clicked
- Confirms email configuration is working
- Sample content similar to daily digest

## Notification Preferences

Users can configure their email preferences via the dashboard:

### Daily Email Settings
- **Enable/Disable**: Toggle daily email notifications
- **Time**: Set preferred delivery time (default: 08:00)

### Weekly Email Settings
- **Enable/Disable**: Toggle weekly email notifications
- **Day**: Select day of week (Monday-Sunday)
- **Time**: Set preferred delivery time (default: 09:00)

### API Endpoints

#### Get Preferences
```
GET /api/notifications/preferences
```

#### Update Preferences
```
PATCH /api/notifications/preferences
Body: {
  "dailyEmailEnabled": true,
  "dailyEmailTime": "08:00",
  "weeklyEmailEnabled": true,
  "weeklyEmailDay": "MONDAY",
  "weeklyEmailTime": "09:00"
}
```

#### Send Test Email
```
POST /api/notifications/preferences
```

## Cron Job Configuration

Email notifications are sent via a cron job configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-notifications",
      "schedule": "0 * * * *"
    }
  ]
}
```

- **Schedule**: Runs every hour (on the hour)
- **Logic**: Checks each user's preferences and sends emails if current time matches their configured time
- **Path**: `/api/cron/send-notifications`

## Troubleshooting

### Emails Not Sending

1. **Check Environment Variables**
   ```bash
   # Verify .env file contains:
   GMAIL_USER="your-email@gmail.com"
   GMAIL_APP_PASSWORD="your-app-password"
   ```

2. **Verify App Password**
   - App password should be 16 characters
   - Remove any spaces when copying
   - Ensure 2-Step Verification is enabled on Google Account

3. **Check Server Logs**
   ```bash
   # Look for email-related errors in console
   npm run dev
   ```

4. **Test SMTP Connection**
   ```bash
   # Run test email from Notification Preferences UI
   ```

### Emails Going to Spam

1. **Use Verified Domain**: If using custom domain, verify SPF and DKIM records
2. **Warm Up**: Start with small volume, gradually increase
3. **Engagement**: Ensure users opted in to receive emails
4. **Authentication**: Use proper SMTP authentication

### Cron Job Not Running

1. **Vercel Deployment**: Cron jobs only work in production (Vercel)
2. **Check Logs**: View cron execution logs in Vercel dashboard
3. **Manual Trigger**: Test cron endpoint manually:
   ```bash
   curl https://your-domain.vercel.app/api/cron/send-notifications
   ```

### Wrong Time Zone

- Email times are stored in user's local format (HH:mm)
- Cron job runs hourly and compares current UTC hour with user's configured hour
- Adjust user preferences or modify cron logic in `app/api/cron/send-notifications/route.ts`

## Security Best Practices

1. **Never Commit Credentials**
   - Add `.env` to `.gitignore`
   - Use environment variables for all secrets

2. **Use App Passwords**
   - Never use your actual Gmail password
   - Create dedicated app passwords for applications

3. **Rotate Keys Regularly**
   - Change app passwords periodically
   - Revoke unused app passwords

4. **Rate Limiting**
   - Gmail has sending limits (500 emails/day for free accounts)
   - Consider using dedicated email service for high volume

5. **Secure SMTP Connection**
   - Always use TLS (port 587) or SSL (port 465)
   - Never use plain text authentication

## Production Deployment

### Environment Variables (Vercel)

1. Go to Vercel Dashboard > Project > Settings > Environment Variables
2. Add:
   - `GMAIL_USER`: Your Gmail address
   - `GMAIL_APP_PASSWORD`: Your 16-character app password

### Enable Cron Jobs

Cron jobs are automatically enabled when you deploy to Vercel with a `vercel.json` file containing cron configuration.

### Monitor Email Delivery

- Check Vercel function logs for email sending status
- Monitor email bounce rates
- Track user engagement with emails

## Advanced Configuration

### Custom Email Templates

Modify templates in `lib/email.ts`:

```typescript
export function generateDailyEmailHTML(/* params */) {
  return `
    <!DOCTYPE html>
    <html>
      <!-- Your custom HTML -->
    </html>
  `;
}
```

### Additional Email Types

Add new email types by:
1. Creating template function in `lib/email.ts`
2. Adding trigger logic in cron job or API route
3. Updating notification preferences schema if needed

### Email Analytics

Track email performance:
- Add UTM parameters to links
- Use email service analytics (SendGrid, Mailgun)
- Monitor click-through rates

## Support

For issues or questions:
- Check server logs for errors
- Verify SMTP credentials
- Test with manual email send
- Review Nodemailer documentation: https://nodemailer.com

---

**Last Updated**: 2025-01-30
