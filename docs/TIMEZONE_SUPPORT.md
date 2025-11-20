# Timezone Support in DueSync

## Overview

DueSync now fully supports user-specific timezones throughout the application. All dates, times, and Google Calendar syncs respect the user's timezone preference set in Settings.

## How It Works

### 1. User Timezone Preference

- **Location**: Settings → Profile → Timezone
- **Default**: UTC (until user changes it)
- **Storage**: User table in database (`timezone` field)
- **Options**: 70+ timezones across all regions (IANA timezone identifiers)

### 2. Timezone Usage

The app uses the user's timezone preference in three key areas:

#### A. Google Calendar Sync
When syncing tasks to Google Calendar, events are created with the user's timezone:
- **Start time**: Converted to user's timezone
- **End time**: Converted to user's timezone
- **Display**: Google Calendar shows events in your local timezone

**Example:**
- User timezone: `America/New_York` (EST)
- Task due: March 15, 2025 at 2:00 PM
- Google Calendar event: March 15, 2025 at 2:00 PM EST
- If you're in California, Google Calendar will automatically show it as 11:00 AM PST

#### B. Task Display
All task due dates and times are displayed in the user's timezone:
- Task cards
- Task lists
- Priority queue
- Focus mode
- Email notifications

**Functions**:
- `formatRelativeDate(date, timezone)` - Shows "Today", "Tomorrow", or formatted date
- `formatDate(date, formatStr, timezone)` - Custom date formatting
- `formatDateTime(date, time, timezone)` - Combined date and time display

#### C. Frontend Display
A React hook provides timezone information to all components:

```typescript
import { useTimezone } from '@/lib/hooks/useTimezone';

function MyComponent() {
  const { timezone, isUsingBrowserTimezone } = useTimezone();

  // Use timezone in formatting functions
  const displayDate = formatRelativeDate(task.dueDate, timezone);

  return <div>{displayDate}</div>;
}
```

### 3. Fallback Behavior

If a user hasn't set a timezone preference:
1. **Server-side**: Defaults to UTC for Google Calendar sync
2. **Client-side**: Uses browser's detected timezone for display
3. **Recommended**: Users should set their timezone in Settings for accurate calendar syncs

## Setting Your Timezone

### Step-by-Step

1. Click your profile icon (top right)
2. Select "Settings"
3. Navigate to "Profile" section
4. Find "Timezone" dropdown
5. Select your timezone from the list
6. Click "Save Changes"

### Available Timezones

**Major regions covered:**
- **Americas**: US (all zones), Canada, Mexico, South America
- **Europe**: All major cities and countries
- **Asia**: Middle East, South Asia, East Asia, Southeast Asia
- **Africa**: Major cities
- **Oceania**: Australia, New Zealand, Pacific islands

**Common selections:**
- `America/New_York` - Eastern Time (US & Canada)
- `America/Los_Angeles` - Pacific Time (US & Canada)
- `Europe/London` - London (UK)
- `Europe/Paris` - Central European Time
- `Asia/Tokyo` - Japan
- `Australia/Sydney` - Sydney, Australia

## Technical Implementation

### Database Schema

```prisma
model User {
  id       String @id @default(cuid())
  timezone String @default("UTC")
  // ... other fields
}
```

### API Functions

**Google Calendar Integration** (`lib/google-calendar.ts`):
```typescript
// Fetches user's timezone before creating/updating events
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { timezone: true },
});
const userTimezone = user?.timezone || 'UTC';

// Uses timezone in Google Calendar API calls
const event = {
  start: {
    dateTime: startDate.toISOString(),
    timeZone: userTimezone, // User's timezone
  },
  end: {
    dateTime: endDate.toISOString(),
    timeZone: userTimezone, // User's timezone
  },
};
```

**Utility Functions** (`lib/utils.ts`):
```typescript
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

// Timezone-aware date formatting
export function formatDate(
  date: Date | string,
  formatStr: string = 'MMM d, yyyy',
  timezone?: string
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (timezone) {
    return formatInTimeZone(dateObj, timezone, formatStr);
  }

  return format(dateObj, formatStr);
}
```

**React Hook** (`lib/hooks/useTimezone.ts`):
```typescript
export function useTimezone() {
  const { data: session } = useSession();
  const { data: profile } = useQuery({
    queryKey: ['user-profile', session?.user?.id],
    queryFn: async () => {
      const response = await fetch('/api/user/profile');
      return response.json();
    },
  });

  const timezone = profile?.timezone ||
                   Intl.DateTimeFormat().resolvedOptions().timeZone ||
                   'UTC';

  return { timezone, isUsingBrowserTimezone: !profile?.timezone };
}
```

### Component Updates

**TaskCard Component**:
```typescript
import { useTimezone } from '@/lib/hooks/useTimezone';

export function TaskCard({ task }: TaskCardProps) {
  const { timezone } = useTimezone();

  return (
    <div>
      {/* Display date in user's timezone */}
      <span>{formatRelativeDate(task.dueDate, timezone)}</span>

      {/* Display time */}
      {task.dueTime && <span>{formatTime12Hour(task.dueTime)}</span>}
    </div>
  );
}
```

## Examples

### Scenario 1: User in New York

**Settings:**
- Timezone: `America/New_York` (EST/EDT)

**Creating a task:**
- Due date: March 15, 2025
- Due time: 2:00 PM
- User sees: "Tomorrow at 2:00 PM" (if today is March 14)

**Google Calendar sync:**
- Event created: March 15, 2025 at 2:00 PM EST
- If colleague in London opens the event, they see: 7:00 PM GMT

### Scenario 2: User in Tokyo

**Settings:**
- Timezone: `Asia/Tokyo` (JST)

**Creating a task:**
- Due date: December 1, 2025
- Due time: 9:00 AM
- User sees: "Monday at 9:00 AM"

**Google Calendar sync:**
- Event created: December 1, 2025 at 9:00 AM JST
- If user travels to San Francisco, Google Calendar shows: November 30, 2025 at 4:00 PM PST

### Scenario 3: User hasn't set timezone

**Settings:**
- Timezone: (not set, defaults to UTC in database)
- Browser: Chrome in Los Angeles (PST)

**Task display:**
- Uses browser's detected timezone (PST) for display
- Shows dates/times as they would appear in Los Angeles

**Google Calendar sync:**
- Uses UTC as timezone (because not set in settings)
- **Recommendation**: Set timezone in Settings for accurate syncs

## Best Practices

### For Users

1. **Set your timezone in Settings**
   - Ensures accurate Google Calendar syncs
   - Provides consistent experience across devices

2. **Update timezone when traveling**
   - Temporarily change timezone if in different location
   - Change back when you return home

3. **Check timezone after syncing**
   - Open Google Calendar to verify event times
   - Make sure times match your expectation

### For Developers

1. **Always pass timezone parameter**
   ```typescript
   // Good
   formatRelativeDate(task.dueDate, timezone)

   // Bad (uses local browser timezone)
   formatRelativeDate(task.dueDate)
   ```

2. **Use the timezone hook in components**
   ```typescript
   const { timezone } = useTimezone();
   ```

3. **Test with different timezones**
   - Test edge cases (DST transitions, UTC offsets)
   - Verify Google Calendar sync across timezones

4. **Handle timezone mismatches gracefully**
   - Always provide fallbacks
   - Show clear messaging if timezone not set

## Troubleshooting

### Issue: Google Calendar shows wrong times

**Solution:**
1. Go to Settings → Profile
2. Verify your timezone is set correctly
3. If correct, unsync and re-sync the task
4. Check Google Calendar settings (should auto-detect)

### Issue: Tasks show in wrong timezone

**Solution:**
1. Clear browser cache
2. Sign out and sign back in
3. Verify timezone setting in profile
4. Check browser's timezone detection

### Issue: Timezone not saving

**Solution:**
1. Check internet connection
2. Try a different timezone
3. Refresh page after saving
4. Check console for errors

### Issue: Times off by 1 hour during DST

**Solution:**
- This is normal during Daylight Saving Time transitions
- Timezones automatically handle DST
- Google Calendar accounts for DST changes

## Migration Notes

### Existing Users

All existing users have `timezone` defaulted to `UTC` in the database. To get accurate timezone support:

1. Visit Settings → Profile
2. Select your actual timezone
3. Click "Save Changes"
4. Re-sync any existing Google Calendar events (optional)

### Existing Calendar Events

Calendar events created before timezone support:
- Were created with UTC timezone
- Will continue to work correctly
- Can be updated by editing and re-syncing the task
- No data loss or corruption

## Future Enhancements

Potential improvements for timezone support:

1. **Auto-detect timezone on signup**
   - Set user's timezone automatically on first login
   - Use browser's detected timezone as default

2. **Timezone conversion display**
   - Show multiple timezone equivalents
   - "2:00 PM EST (7:00 PM UTC, 11:00 AM PST)"

3. **Smart timezone suggestions**
   - Suggest timezone based on IP location
   - Warn if timezone doesn't match browser

4. **Time zone-aware reminders**
   - Send notifications at correct local time
   - Handle traveling users automatically

5. **Meeting scheduler**
   - Show available times across timezones
   - Find overlapping working hours

## Dependencies

- **date-fns**: Date manipulation and formatting
- **date-fns-tz**: Timezone-aware date operations
- **Next.js**: Server-side timezone handling
- **React Query**: Caching timezone preferences

```json
{
  "date-fns": "^4.1.0",
  "date-fns-tz": "^3.2.0"
}
```

## API Reference

### Utility Functions

#### `formatDate(date, formatStr?, timezone?)`
Format a date with optional timezone.

**Parameters:**
- `date` (Date | string): Date to format
- `formatStr` (string): Format string (default: 'MMM d, yyyy')
- `timezone` (string): IANA timezone (optional)

**Returns:** Formatted date string

#### `formatRelativeDate(date, timezone?)`
Format date relative to today (Today, Tomorrow, or date).

**Parameters:**
- `date` (Date | string): Date to format
- `timezone` (string): IANA timezone (optional)

**Returns:** Relative date string

#### `formatDateTime(date, time?, timezone?)`
Format date and time together.

**Parameters:**
- `date` (Date | string): Date to format
- `time` (string | null): Time string (HH:mm)
- `timezone` (string): IANA timezone (optional)

**Returns:** Combined date/time string

### React Hooks

#### `useTimezone()`
Get current user's timezone preference.

**Returns:**
```typescript
{
  timezone: string;              // User's timezone or fallback
  userTimezone: string | null;   // User's set timezone
  browserTimezone: string;       // Browser's detected timezone
  isUsingBrowserTimezone: boolean; // Whether fallback is active
}
```

## Support

For timezone-related issues or questions:
1. Check this documentation
2. Verify timezone setting in Settings → Profile
3. Test with different timezones
4. Check browser console for errors

---

**Version:** 1.0.0
**Last Updated:** November 20, 2025
**Status:** Production Ready ✅

**© 2025 WIK Technologies - DueSync Timezone Support**
