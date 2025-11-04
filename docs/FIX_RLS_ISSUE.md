# Fix RLS (Row-Level Security) Issue

## Problem
Tasks are not showing in the frontend despite being added to the database. This is likely due to Row-Level Security (RLS) policies in Supabase blocking queries.

## Root Cause
Your app uses **NextAuth** for authentication (not Supabase Auth), but Supabase RLS policies use `auth.uid()` which only works with Supabase Auth. This creates a mismatch.

## Solution Options

### Option 1: Disable RLS (Recommended for NextAuth)

Since you're using NextAuth (not Supabase Auth), the simplest solution is to disable RLS and rely on your API's authentication checks.

**Steps:**

1. **Open Supabase SQL Editor:**
   - Go to your Supabase dashboard
   - Navigate to **SQL Editor**

2. **Disable RLS on all tables:**

```sql
-- Disable RLS on all tables
ALTER TABLE "Task" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Tag" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "TaskTag" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "NotificationPreference" DISABLE ROW LEVEL SECURITY;
```

3. **Verify RLS is disabled:**

```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('Task', 'User', 'Account', 'Session', 'Category', 'Tag', 'TaskTag', 'NotificationPreference');
```

You should see `rowsecurity = false` for all tables.

**Security:** Your API routes already check authentication using `requireAuth()`, so disabling RLS is safe.

### Option 2: Use Service Role Key (Alternative)

If you must keep RLS enabled, use the Supabase service role key (bypasses RLS):

1. Update your `.env`:
```env
# Use service role key instead of anon key
DATABASE_URL="postgresql://postgres.xxx:SERVICE_ROLE_KEY@..."
```

2. Get the service role key from:
   - Supabase Dashboard → **Settings** → **API** → **Project API keys** → **service_role** (secret)

⚠️ **Warning:** Never expose the service role key to the client side!

### Option 3: Custom RLS with JWT (Advanced)

Keep RLS but configure it to work with NextAuth JWTs. This is complex and not recommended unless you have specific compliance requirements.

## Quick Fix Commands

Run this in Supabase SQL Editor to disable RLS immediately:

```sql
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
    LOOP
        EXECUTE 'ALTER TABLE ' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY';
    END LOOP;
END $$;
```

## Verify the Fix

After disabling RLS:

1. Visit `https://duesync.vercel.app/api/debug/tasks`
2. Reload your dashboard
3. Tasks should now appear

## Additional Troubleshooting

If tasks still don't show after disabling RLS, check for user ID mismatch:

```sql
-- Run in Supabase SQL Editor
SELECT
    u.id as user_id,
    u.email,
    COUNT(t.id) as task_count
FROM "User" u
LEFT JOIN "Task" t ON t."userId" = u.id
GROUP BY u.id, u.email
ORDER BY task_count DESC;
```

This shows which user owns the tasks. If the tasks belong to a different user ID than your current session, you'll need to either:
- Delete the old user and re-create tasks
- Update the tasks' userId to match your current account
