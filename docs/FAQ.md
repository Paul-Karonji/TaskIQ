# Frequently Asked Questions (FAQ)

## General Questions

### What is DueSync?

DueSync is a modern, intelligent task management application that helps you organize your work, sync with Google Calendar, receive notifications, and boost productivity with features like Focus Mode and recurring tasks.

### Is DueSync free?

Yes! DueSync is currently free to use. We may introduce premium features in the future, but core functionality will always remain free.

### What devices can I use DueSync on?

DueSync works on:
- ✅ Desktop browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Android Chrome)
- ✅ Tablets

A native mobile app is planned for the future.

### Do I need a Google account?

Yes, DueSync uses Google OAuth for authentication. You must have a Google account to sign in. This also enables Google Calendar integration.

---

## Account & Data

### How do I create an account?

1. Visit DueSync website
2. Click "Sign in with Google"
3. Authorize with your Google account
4. That's it! No email verification or password needed.

### Can I use multiple Google accounts?

You can sign out and sign in with a different Google account, but DueSync currently only supports one account at a time per browser session.

### What data does DueSync store?

DueSync stores:
- Your name and email (from Google)
- Profile picture (from Google)
- Tasks (title, description, dates, etc.)
- Categories and tags you create
- Notification preferences
- Calendar sync status

### Is my data secure?

Yes! We take security seriously:
- ✅ All data encrypted in transit (HTTPS/TLS)
- ✅ Secure PostgreSQL database
- ✅ Google OAuth authentication
- ✅ No passwords stored
- ✅ Regular security audits

See our [Security Policy](../SECURITY.md) for details.

### Can I export my data?

Yes!
1. Go to Settings → Data & Privacy
2. Click "Export My Data"
3. Download JSON file with all your tasks, categories, and tags

### How do I delete my account?

1. Go to Settings → Data & Privacy
2. Click "Delete Account"
3. Confirm deletion
4. All your data will be permanently removed within 30 days

**Warning**: This action cannot be undone!

### What happens to my data if I delete my account?

- All tasks, categories, tags deleted
- Calendar events remain in your Google Calendar (we don't delete those)
- Email notifications stop
- Push notification subscriptions removed
- Account completely removed within 30 days

---

## Tasks

### How do I create a task?

1. Click the "+ Add a task" button
2. Enter a title (required)
3. Set a due date (required)
4. Optionally add description, time, priority, category, tags
5. Click "Create Task"

See [Managing Tasks](./USER_GUIDE.md#managing-tasks) for details.

### What's the difference between categories and tags?

- **Categories**: Like folders. Each task has ONE category. Examples: "Work", "Personal"
- **Tags**: Like labels. Each task can have MULTIPLE tags. Examples: "urgent", "waiting-on"

### Can I edit a task after creating it?

Yes! Hover over the task card and click the Edit button (pencil icon).

### What happens to deleted tasks?

Deleted tasks are permanently removed and cannot be recovered. We recommend archiving tasks instead of deleting them.

### Can I recover a deleted task?

No. Once deleted, tasks cannot be recovered. Always use Archive if you might need the task later.

### What's the difference between archiving and deleting?

- **Archive**: Task hidden but kept. Can be restored. Good for completed projects.
- **Delete**: Task permanently removed. Cannot be recovered. Use rarely.

### Why can't I see my completed tasks?

Completed tasks appear in the "Completed Tasks" section at the bottom of your dashboard. You can also filter by Status → Completed.

### Can I duplicate a task?

Currently, there's no duplicate feature. You can:
- Create a new task with the same details manually
- Use recurring tasks if it repeats regularly

### What's the maximum number of tasks I can create?

There's no hard limit, but for optimal performance, we recommend keeping active (non-archived) tasks under 1000.

---

## Google Calendar Integration

### How do I sync with Google Calendar?

During sign-in, grant calendar permissions. Then:
1. Find a task
2. Click the Calendar Sync button (📆 icon)
3. Task appears in your Google Calendar

### Do I need to sync every task?

No! Only sync tasks that need to be on your calendar. Syncing is optional and task-specific.

### What if I didn't grant calendar permissions during sign-in?

1. Go to Settings → Accounts
2. Click "Reconnect to Google Calendar"
3. Grant calendar permission
4. Now you can sync tasks

### Can I sync to a specific Google Calendar?

Currently, tasks sync to your primary Google Calendar. Support for multiple calendars is planned for the future.

### If I edit a task in DueSync, does it update in Google Calendar?

Yes! If the task is synced, changes in DueSync update the calendar event automatically.

### If I edit a calendar event in Google Calendar, does it update in DueSync?

No. Sync is currently one-way: DueSync → Google Calendar only. Changes in Google Calendar don't sync back to DueSync.

### Can I unsync a task from Google Calendar?

Yes! Click the Calendar Sync button again. The calendar event will be deleted, but the task remains in DueSync.

### Why isn't my task syncing?

Common issues:
- Calendar permission not granted
- Token expired (sign out and back in)
- Task doesn't have a due date
- Network connection issue

### What if I see "Token expired" error?

1. Sign out of DueSync
2. Go to Google Account → Security → Third-party apps
3. Remove DueSync access
4. Sign back into DueSync
5. Grant permissions again

---

## Notifications

### How do I enable email notifications?

1. Go to Settings → Notifications
2. Enable "Daily Email Summaries" or "Weekly Email Reports"
3. Choose time/day
4. Save settings

### Why am I not receiving email notifications?

Check:
- ✅ Notifications enabled in Settings?
- ✅ Email address correct in Settings → Profile?
- ✅ Check spam/junk folder
- ✅ Send test email to verify

### Can I change the time for daily emails?

Yes!
1. Settings → Notifications
2. Change "Daily Email Time"
3. Save settings

### How do I enable push notifications?

1. Settings → Notifications
2. Click "Enable Push Notifications"
3. Grant permission in browser prompt

### What browsers support push notifications?

- ✅ Chrome (Desktop & Android)
- ✅ Firefox (Desktop & Android)
- ✅ Edge (Desktop)
- ✅ Safari (Desktop & iOS 16.4+)
- ❌ Internet Explorer

### Why am I not receiving push notifications?

Check:
- ✅ Browser permission granted?
- ✅ Notifications enabled in Settings?
- ✅ Browser supports push notifications?
- ✅ Device/OS allows notifications?

### Can I customize notification times?

Yes! In Settings → Notifications, you can set:
- Daily email time
- Weekly email day and time
- Push notification reminder intervals (15 min, 60 min before)

### How do I stop receiving notifications?

**Email**:
- Settings → Notifications
- Disable email options

**Push**:
- Settings → Notifications
- Click "Disable Push Notifications"

---

## Focus Mode

### What is Focus Mode?

A distraction-free environment showing only today's tasks with an optional Pomodoro timer to boost productivity.

### How do I access Focus Mode?

Click the "Focus Mode" button (blue gradient, target icon) on the dashboard.

### What is the Pomodoro Technique?

A time management method:
- Work for 25 minutes (1 Pomodoro)
- Take a 5-minute break
- Repeat

DueSync's timer is fully customizable (1-60 min work, 1-30 min break).

### Can I use Focus Mode without the timer?

Yes! The timer is optional. You can just use Focus Mode for a clean, simple task view.

### Does Focus Mode work offline?

The interface loads, but you need internet to save task completions and sync changes.

### Can I customize the timer duration?

Yes!
1. Click Settings icon (⚙️) in Focus Mode
2. Adjust work duration (1-60 min)
3. Adjust break duration (1-30 min)
4. Save

---

## Recurring Tasks

### What are recurring tasks?

Tasks that automatically create new instances on a schedule (daily, weekly, or monthly).

### How do I create a recurring task?

1. When creating a task, check "Recurring Task"
2. Select pattern (Daily, Weekly, or Monthly)
3. Create task

### How does recurrence work?

When a recurring task is completed or its due date passes:
- System automatically creates a new instance
- New instance has the next due date
- Continues indefinitely until you stop it

### Can I stop a recurring task?

Yes!
1. Edit the task
2. Uncheck "Recurring Task"
3. Save

No more instances will be generated.

### If I delete a recurring task, does it delete all future instances?

No. Deleting only removes that specific instance. Future instances are still generated from the original recurring task.

To stop all future instances: Edit and uncheck "Recurring Task" first, then delete.

### Can I skip a single occurrence?

Yes. Just archive or delete that specific instance. The next instance will still be generated on schedule.

### Can I customize recurrence patterns (e.g., every 2 weeks)?

Currently, only Daily, Weekly, and Monthly are supported. Advanced patterns (every N days, skip weekends) are planned for the future.

---

## Performance & Technical

### Is DueSync available offline?

DueSync requires internet to sync data. Some features (like viewing cached tasks) may work briefly offline, but full offline support is not yet available.

### Why is DueSync slow?

Common causes:
- Slow internet connection
- Too many browser extensions
- Outdated browser
- Large number of tasks (1000+)

Try:
- Clear browser cache
- Disable extensions
- Update browser
- Archive old tasks

### What browsers are supported?

**Fully Supported**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Limited Support**:
- Older browser versions may work but aren't tested

**Not Supported**:
- Internet Explorer

### Does DueSync work on mobile?

Yes! DueSync is responsive and works on mobile browsers. A native mobile app is planned for the future.

### Can I use DueSync on multiple devices?

Yes! Your data syncs across all devices where you're signed in with the same Google account.

### How often does data sync?

Data syncs in real-time:
- Creating/editing tasks: Immediate
- Completing tasks: Immediate
- Category/tag changes: Immediate

### Will there be a mobile app?

A native mobile app (iOS & Android) is on our roadmap! Follow us for updates.

### Will there be a desktop app?

An Electron desktop app is being considered for the future.

---

## Billing & Pricing

### How much does DueSync cost?

DueSync is currently **completely free**!

### Will DueSync always be free?

Core features will always be free. We may introduce premium features in the future, but basic task management will remain free.

### What premium features are planned?

Potential premium features (not finalized):
- Team collaboration
- Advanced recurring patterns
- Unlimited calendar syncs
- Priority support
- Custom integrations
- Advanced analytics

### Do you offer discounts for students or nonprofits?

If we introduce paid plans, we plan to offer discounts for:
- Students
- Educators
- Nonprofits
- Open source projects

---

## Privacy & Security

### Is DueSync GDPR compliant?

Yes! We respect your data rights:
- ✅ Right to access your data (export feature)
- ✅ Right to deletion (account deletion)
- ✅ Right to portability (JSON export)
- ✅ Transparent privacy policy

### Do you sell my data?

**Absolutely not!** We never sell, rent, or share your personal data with third parties for marketing purposes.

### What third-party services do you use?

- **Google**: OAuth authentication & Calendar API
- **Supabase**: Database hosting (PostgreSQL)
- **Vercel**: Application hosting (if deployed)

All have strict privacy policies and security measures.

### How long do you keep my data?

- **Active accounts**: Data retained indefinitely while account is active
- **Deleted accounts**: All data permanently deleted within 30 days

### Do you use cookies?

Yes, for essential functionality:
- Authentication session cookies (required)
- Theme preference (optional)
- Analytics cookies (if enabled, optional)

See our Privacy Policy for details.

### Where is my data stored?

Your data is stored in secure PostgreSQL databases hosted by Supabase in AWS data centers (configurable region).

---

## Features & Roadmap

### What features are coming next?

On our roadmap:
- ✅ Edit task dialog (in progress)
- 🔄 Subtasks
- 🔄 Task templates
- 🔄 Keyboard shortcuts
- 🔄 Drag-and-drop reordering
- 🔄 Calendar view
- 🔄 Team collaboration
- 🔄 Mobile apps
- 🔄 Third-party integrations

### Can I request a feature?

Yes! We'd love to hear your ideas:
- Email: infoduesync@wiktechnologies.com
- GitHub Issues: Open a feature request

### How do I report a bug?

1. **Email**: infoduesync@wiktechnologies.com
2. **GitHub**: Open an issue with details
3. **In-App**: Use the feedback button (coming soon)

Include:
- Browser and version
- Steps to reproduce
- Screenshots if possible

### Can I contribute to DueSync?

DueSync is currently not open source, but we're considering it for the future. Follow our GitHub for updates.

---

## Getting Help

### How do I contact support?

- **Email**: infoduesync@wiktechnologies.com
- **Response Time**: Within 24-48 hours
- **Security Issues**: infoduesync@wiktechnologies.com

### Where can I find more documentation?

- **User Guide**: [USER_GUIDE.md](./USER_GUIDE.md)
- **Security Policy**: [SECURITY.md](../SECURITY.md)
- **Technical Docs**: Check `/docs` folder in repository

### Is there a community forum?

Coming soon! We're setting up:
- Discord server
- Community forum
- Newsletter for updates

### Can I schedule a demo or training?

For teams or organizations, contact us at infoduesync@wiktechnologies.com (if applicable).

---

## Troubleshooting

### I forgot my password. How do I reset it?

DueSync doesn't use passwords! Authentication is through Google OAuth. If you can't sign in:
1. Make sure you're using the correct Google account
2. Try signing out of Google and back in
3. Clear browser cache and try again

### The app isn't loading

Try:
1. Refresh the page
2. Clear browser cache
3. Try incognito/private mode
4. Try a different browser
5. Check your internet connection

### I'm seeing an error message

Common errors:

**"Unauthorized"**: Sign out and back in

**"Token expired"**: Reconnect Google Calendar

**"Rate limit exceeded"**: Wait a few minutes, you're making too many requests

**"Network error"**: Check internet connection

For other errors, contact support with a screenshot.

---

**Still have questions?** Contact us at infoduesync@wiktechnologies.com

**Last Updated**: December 2025
