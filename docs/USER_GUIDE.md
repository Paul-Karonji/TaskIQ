# DueSync User Guide

Welcome to DueSync! This comprehensive guide will help you master all the features of DueSync to boost your productivity and stay organized.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Managing Tasks](#managing-tasks)
3. [Categories & Tags](#categories--tags)
4. [Google Calendar Integration](#google-calendar-integration)
5. [Notifications](#notifications)
6. [Focus Mode](#focus-mode)
7. [Recurring Tasks](#recurring-tasks)
8. [Archive & History](#archive--history)
9. [Settings](#settings)
10. [Tips & Tricks](#tips--tricks)
11. [Keyboard Shortcuts](#keyboard-shortcuts)
12. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Creating Your Account

1. Visit the DueSync website
2. Click "Sign in with Google"
3. Authorize DueSync to access your Google account
4. Grant calendar permissions (optional but recommended)
5. Complete the interactive onboarding tour

### First Look at the Dashboard

Your dashboard has three main sections:

- **Left Sidebar**: Filters and search
- **Center**: Task list and quick add form
- **Right Sidebar**: Priority queue (most urgent tasks)

### Quick Tour

When you first log in, you'll see an interactive tour highlighting:
- ✅ Quick Add Task form
- ✅ Filters panel
- ✅ Category & Tag management
- ✅ Focus Mode
- ✅ Priority Queue
- ✅ Settings

💡 **Tip**: You can restart the tour anytime from Settings → Profile → Resume Tour

---

## Managing Tasks

### Creating a Task

#### Using Quick Add (Fastest Way)

1. Click the **"+ Add a task"** button at the top of your task list
2. Fill in the required fields:
   - **Title**: What needs to be done? (required)
   - **Due Date**: When is it due? (required)
3. Optionally add:
   - **Description**: Additional details
   - **Due Time**: Specific time of day
   - **Priority**: HIGH, MEDIUM (default), or LOW
   - **Category**: Organize by project or area
   - **Tags**: Add multiple labels
   - **Estimated Time**: How many minutes?
   - **Recurring**: Daily, weekly, or monthly repeat

3. Click **"Create Task"**

#### Field Details

**Title** (Required)
- Keep it action-oriented (e.g., "Call dentist" not "Dentist")
- Be specific enough to know what to do

**Description** (Optional)
- Add context, links, or details
- Markdown supported for formatting

**Due Date** (Required)
- Pick from calendar widget
- Tasks due today appear in Focus Mode

**Due Time** (Optional)
- Set specific time for calendar sync
- Defaults to 9:00 AM if not specified

**Priority**
- 🔴 **HIGH**: Urgent and important
- 🟡 **MEDIUM**: Standard priority (default)
- 🟢 **LOW**: Nice to have, not urgent

**Estimated Time**
- Enter minutes (e.g., 30, 60, 120)
- Helps with calendar blocking
- Used in Focus Mode Pomodoro timer

### Viewing Tasks

#### Task List Display

Each task card shows:
- ✅ Checkbox for completion
- 📝 Title and description
- 📅 Due date and time
- 🏷️ Category badge (colored)
- 🏷️ Tag badges
- ⏱️ Estimated time
- 🔄 Recurring indicator (if applicable)
- 📆 Calendar sync status
- ⚡ Actions (edit, delete, archive)

#### Color Coding

Tasks have a colored left border indicating priority:
- **Red**: HIGH priority
- **Amber/Yellow**: MEDIUM priority
- **Green**: LOW priority

#### Overdue Tasks

Tasks past their due date show:
- ⚠️ "Overdue" badge
- Different background color
- Appear at the top of the list

### Completing Tasks

1. Click the checkbox next to any task
2. Task gets strikethrough styling
3. Moves to "Completed" section
4. Updates your statistics

**To undo**: Click the checkbox again to mark as pending

### Editing Tasks

1. Hover over a task card
2. Click the **Edit** button (pencil icon)
3. Modify any fields
4. Click **"Save Changes"**

### Deleting Tasks

1. Hover over a task card
2. Click the **Delete** button (trash icon)
3. Confirm deletion in the dialog
4. Task is permanently removed

⚠️ **Warning**: Deleted tasks cannot be recovered. Consider archiving instead.

### Archiving Tasks

1. Hover over a task card
2. Click the **Archive** button
3. Task moves to Archive page
4. Can be restored or permanently deleted later

---

## Categories & Tags

### Understanding the Difference

**Categories**: Think of these as folders or projects
- Each task can have ONE category
- Examples: "Work", "Personal", "Home", "Health"

**Tags**: Think of these as labels or attributes
- Each task can have MULTIPLE tags
- Examples: "urgent", "waiting-on", "quick-win", "idea"

### Creating Categories

1. Click **"Manage Categories"** on the dashboard
2. Click **"+ New Category"**
3. Enter a name (e.g., "Work Projects")
4. Choose a color from the picker
5. Click **"Create"**

### Creating Tags

1. Click **"Manage Tags"** on the dashboard
2. Click **"+ New Tag"**
3. Enter a name (e.g., "urgent")
4. Choose a color
5. Click **"Create"**

### Editing Categories/Tags

1. Open the manager dialog
2. Click the **Edit** button (pencil icon)
3. Change name or color
4. Click **"Save"**

### Deleting Categories/Tags

1. Open the manager dialog
2. Click the **Delete** button (trash icon)
3. Confirm deletion
4. Tasks with this category/tag will be unlinked (not deleted)

### Using Categories & Tags

When creating or editing a task:
1. Click the **Category** dropdown
2. Select one category
3. Click the **Tags** dropdown
4. Select multiple tags (hold Ctrl/Cmd for multiple)

### Filtering by Categories & Tags

In the left sidebar:
1. Use the **Category** filter dropdown
2. Use the **Tag** filter dropdown
3. Combine with status and priority filters

---

## Google Calendar Integration

### Connecting Your Calendar

Your calendar is connected during sign-in when you authorize Google Calendar access.

**To verify connection**:
1. Go to Settings → Accounts
2. Check "Google Calendar" status
3. If not connected, click "Reconnect"

### Syncing Tasks to Calendar

#### Manual Sync

1. Find the task you want to sync
2. Click the **Calendar Sync** button (📆 icon)
3. Task creates a calendar event
4. Event appears in your Google Calendar
5. Icon changes to show sync status

#### What Gets Synced

When you sync a task, it creates a calendar event with:
- **Title**: Task title
- **Description**: Task description
- **Start Time**: Due date + due time (or 9:00 AM)
- **End Time**: Start time + estimated time (or 30 min)
- **Reminders**:
  - Email: 24 hours before
  - Popup: 30 minutes before

### Unsyncing from Calendar

1. Click the **Calendar Sync** button again
2. Confirms "Unsync from calendar?"
3. Event is removed from Google Calendar
4. Task remains in DueSync

### Two-Way Sync

- ✅ Changes in DueSync → Update calendar event
- ❌ Changes in calendar → Don't update DueSync task (one-way only)

### Troubleshooting Calendar Sync

**"No Google account connected"**
- Go to Settings → Accounts
- Click "Reconnect to Google Calendar"

**"Token expired"**
- Sign out
- Go to Google Account → Security → Third-party access
- Remove DueSync
- Sign in again

**"Permission denied"**
- During sign-in, make sure to check the calendar permission box

---

## Notifications

### Email Notifications

#### Daily Email Summary

Get a morning email with today's tasks:

1. Go to Settings → Notifications
2. Enable "Daily Email Summaries"
3. Choose your preferred time (default: 8:00 AM)
4. Save settings

**Email includes**:
- Tasks due today
- Overdue tasks
- High priority tasks

#### Weekly Email Report

Get a weekly productivity report:

1. Go to Settings → Notifications
2. Enable "Weekly Email Reports"
3. Choose day (default: Monday)
4. Choose time (default: 9:00 AM)
5. Save settings

**Email includes**:
- Tasks completed this week
- Tasks pending
- Tasks overdue
- Productivity statistics

#### Testing Email

Click **"Send Test Email"** to verify your email settings work.

### Push Notifications

#### Enabling Push Notifications

1. Go to Settings → Notifications
2. Click **"Enable Push Notifications"**
3. Grant permission in your browser
4. Configure reminder times

**Browser Support**:
- ✅ Chrome/Edge (Desktop & Android)
- ✅ Firefox (Desktop & Android)
- ✅ Safari (Desktop & iOS 16.4+)
- ❌ Internet Explorer

#### Notification Types

**Task Reminders**
- Sent before task due time
- Configurable (15 min, 60 min before)

**Due Today**
- Sent every morning at 8:00 AM
- Lists all tasks due today

**Overdue Alerts**
- Sent every morning at 9:00 AM
- Lists all overdue tasks

#### Testing Push Notifications

Click **"Send Test Notification"** to verify push notifications work.

#### Disabling Push Notifications

1. Settings → Notifications
2. Click **"Disable Push Notifications"**
3. Or disable in browser settings:
   - Chrome: Site Settings → Notifications
   - Firefox: Permissions → Notifications
   - Safari: Website Settings → Notifications

---

## Focus Mode

Focus Mode provides a distraction-free environment to work through today's tasks with an optional Pomodoro timer.

### Accessing Focus Mode

Click the **"Focus Mode"** button on the dashboard (blue gradient button with target icon).

### Features

**Today's Tasks Only**
- Shows only tasks due today
- Minimal interface
- One task at a time

**Pomodoro Timer**
- Circular progress indicator
- Work session (default: 25 minutes)
- Break session (default: 5 minutes)
- Sound notification when timer completes

**Task Navigation**
- Previous/Next buttons
- Progress dots showing position
- Complete task checkbox

### Using the Pomodoro Timer

1. Click **"Start"** to begin work session
2. Focus on the current task
3. Timer counts down
4. Sound plays when session ends
5. Click **"Start Break"** for break session
6. After break, start next work session

### Customizing Timer

1. Click the **Settings** icon (⚙️)
2. Adjust work duration (1-60 minutes)
3. Adjust break duration (1-30 minutes)
4. Toggle sound on/off
5. Click **"Save"**

### Completing Tasks in Focus Mode

1. Check the task checkbox when done
2. Task is marked complete
3. Automatically moves to next task

### Exiting Focus Mode

Click **"Back to Dashboard"** at the top.

---

## Recurring Tasks

Recurring tasks automatically generate new instances on a schedule.

### Creating a Recurring Task

1. When creating a task, check **"Recurring Task"**
2. Select pattern:
   - **Daily**: Repeats every day
   - **Weekly**: Repeats every week on the same day
   - **Monthly**: Repeats every month on the same date
3. Create the task

### How Recurring Tasks Work

**Automatic Generation**:
- System checks every hour for recurring tasks
- When a recurring task is completed (or due date passes)
- New instance is automatically created
- New instance has:
  - Same title, description, priority
  - Same category and tags
  - Next due date based on pattern
  - New unique ID

**Example**:
- Original: "Daily standup" due Nov 1, 2025 (Daily)
- After completion: New task "Daily standup" due Nov 2, 2025
- Pattern continues indefinitely

### Identifying Recurring Tasks

Look for the 🔄 **Repeat icon** on the task card.

### Modifying Recurring Tasks

**Editing a single instance**:
- Changes only affect that one instance
- Future instances not affected

**Stopping recurrence**:
- Edit the task
- Uncheck "Recurring Task"
- No more instances will be generated

### Deleting Recurring Tasks

**Delete one instance**: Only that occurrence is removed

**Delete all future instances**: Edit and uncheck "Recurring Task", then delete

---

## Archive & History

### Viewing Archived Tasks

1. Click **"View Archive"** on the dashboard
2. See all archived tasks
3. Filter by category, tag, or date

### Archiving vs. Deleting

**Archive** (Recommended):
- ✅ Task hidden from main view
- ✅ Can be restored later
- ✅ Kept for records
- ✅ Counts toward statistics

**Delete**:
- ❌ Permanently removed
- ❌ Cannot be recovered
- ❌ Lost forever

### Restoring Archived Tasks

1. Go to Archive page
2. Find the task
3. Click **"Restore"**
4. Task returns to pending status

### Permanently Deleting from Archive

1. Go to Archive page
2. Find the task
3. Click **"Delete Permanently"**
4. Confirm deletion
5. Task is gone forever

### Viewing Completed Tasks

Completed tasks appear in the "Completed Tasks" section on the dashboard. They can also be:
- Unchecked to mark as pending again
- Archived for long-term storage
- Deleted if no longer needed

---

## Settings

### Profile Settings

**View your information**:
- Name
- Email
- Profile picture (from Google)

**Resume Tour**: Restart the onboarding tour

### Notification Preferences

Configure all email and push notification settings (see Notifications section above).

### Account Connections

**Google Account**:
- View connection status
- Reconnect if needed
- Last sync time

**Disconnect**: Sign out removes all connections

### Theme

Toggle between Light and Dark mode:
- Click the moon/sun icon in the top right
- Or use Settings → Theme dropdown

### Time Zone

Your time zone is automatically detected from your browser. Tasks due times use your local time zone.

### Data & Privacy

**Export Your Data**:
1. Go to Settings → Data & Privacy
2. Click **"Export My Data"**
3. Download JSON file with all your tasks

**Delete Your Account**:
1. Go to Settings → Data & Privacy
2. Click **"Delete Account"**
3. Confirm deletion
4. All data is permanently removed within 30 days

---

## Tips & Tricks

### Productivity Tips

1. **Start Each Day in Focus Mode**
   - Review today's tasks
   - Use Pomodoro timer for deep work

2. **Use the Priority Queue**
   - Right sidebar shows urgent tasks
   - Tackle HIGH priority items first

3. **Batch Similar Tasks**
   - Use tags like "email", "calls", "errands"
   - Filter and complete all at once

4. **Weekly Review**
   - Archive completed tasks
   - Review weekly email report
   - Plan next week's priorities

5. **Set Realistic Estimated Times**
   - Helps with calendar blocking
   - Prevents overcommitment

### Organization Tips

1. **Category Strategy**
   - Keep categories broad (5-7 max)
   - Examples: Work, Personal, Health, Home, Learning

2. **Tag Strategy**
   - Use tags for context: @computer, @phone, @errands
   - Use tags for status: waiting-on, idea, someday
   - Use tags for energy: quick-win, deep-work

3. **Color Coding**
   - Use distinct colors for easy visual scanning
   - Match category colors to your workflow

### Time Management

1. **Due Dates**
   - Set realistic due dates
   - Use due times for calendar sync
   - Review overdue tasks weekly

2. **Estimated Time**
   - Always estimate task duration
   - Use for Pomodoro sessions
   - Track actual vs. estimated over time

3. **Recurring Tasks**
   - Use for habits and routines
   - Daily: Exercise, journaling, standup
   - Weekly: Reports, reviews, meal prep
   - Monthly: Billing, backups, check-ins

---

## Keyboard Shortcuts

Coming soon! Keyboard shortcuts will be added in a future update.

Planned shortcuts:
- `Ctrl/Cmd + N`: New task
- `Ctrl/Cmd + F`: Focus search
- `Ctrl/Cmd + K`: Command palette
- `Esc`: Close dialogs
- `Space`: Toggle task completion

---

## Troubleshooting

### Tasks Not Syncing to Calendar

**Check these items**:
1. Google Calendar permission granted?
2. Token expired? (Sign out and back in)
3. Calendar sync button clicked?
4. Check Google Calendar for the event

### Not Receiving Notifications

**Email Notifications**:
1. Check Settings → Notifications (enabled?)
2. Check spam/junk folder
3. Verify email in Settings → Profile
4. Send test email

**Push Notifications**:
1. Browser permission granted?
2. Settings → Notifications (enabled?)
3. Try sending test notification
4. Check browser notification settings

### Tasks Not Appearing

**Check filters**:
1. Status filter set to "All" or "Pending"?
2. Priority filter cleared?
3. Search box empty?
4. Click "Clear Filters"

### Recurring Tasks Not Generating

**Check these**:
1. Original task marked "Recurring"?
2. Pattern selected (Daily/Weekly/Monthly)?
3. Wait up to 1 hour (cron job runs hourly)
4. Original task completed or past due?

### Performance Issues

**If app is slow**:
1. Clear browser cache
2. Disable browser extensions
3. Check internet connection
4. Try incognito/private mode
5. Try different browser

### Data Not Saving

**Check connection**:
1. Internet connected?
2. Check browser console for errors
3. Try refreshing the page
4. Sign out and back in

### Can't Sign In

**Troubleshooting**:
1. Using correct Google account?
2. Pop-up blocker disabled?
3. Third-party cookies enabled?
4. Try incognito mode
5. Try different browser
6. Clear browser cache

---

## Getting Help

### Support Resources

- **FAQ**: Check our FAQ document for common questions
- **Security**: Read SECURITY.md for security-related questions
- **Email Support**: infoduesync@wiktechnologies.com
- **Response Time**: Within 24-48 hours

### Feature Requests

We'd love to hear your ideas!
- Email: infoduesync@wiktechnologies.com
- GitHub Issues: Report bugs or request features

### Community

- Discord: [Coming Soon]
- Twitter: @DueSync (example)
- Newsletter: Monthly productivity tips

---

## Version History

- **v1.0.0** (December 2025): Initial release

---

**Thank you for using DueSync! We hope it helps you stay organized and productive.**

Have feedback? We'd love to hear from you at infoduesync@wiktechnologies.com
