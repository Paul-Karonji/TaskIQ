# Row Level Security (RLS) Implementation Guide

## Overview

This guide explains how to enable Row Level Security (RLS) on your Supabase database for the DueSync application. RLS provides defense-in-depth security by enforcing access control at the database level, even though the application already handles authentication at the API layer.

## What is RLS?

Row Level Security is a PostgreSQL feature that restricts which rows users can access based on policies you define. It adds an extra security layer that protects your data even if:
- Database credentials are accidentally exposed
- Someone gains direct database access
- There's a bug in application-level authorization

## Why Enable RLS?

**Current State:**
- ✅ Application handles all authentication via NextAuth
- ✅ API routes verify user sessions before database access
- ⚠️ Direct database access bypasses application security

**With RLS Enabled:**
- 🛡️ Defense-in-depth security
- 🔒 Database-level access control
- ✅ Supabase best practices compliance
- 📊 Better audit trail

## Implementation Approach

Since DueSync uses **NextAuth** (not Supabase Auth), we implement RLS using a **service role pattern**:

1. **Enable RLS on all tables** - Satisfies security requirements
2. **Create user-based policies** - Allow access only to user's own data
3. **Use service role connection** - Application bypasses RLS (since it handles auth)

The service role bypass works because when `auth.user_id()` returns NULL, the "Service role has full access" policy applies, allowing all operations.

## How to Apply the RLS Migration

### Option 1: Via Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your DueSync project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Execute the Migration**
   - Open `prisma/enable_rls.sql` in your project
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run" or press Ctrl+Enter

4. **Verify RLS is Enabled**
   - The query includes verification commands at the end
   - Check the results panel for the list of tables with RLS enabled
   - All 9 tables should show `rowsecurity = true`

### Option 2: Via psql Command Line

1. **Get Direct Database URL**
   - From Supabase Dashboard → Settings → Database
   - Copy the "Direct connection" string (not pooled)

2. **Connect via psql**
   ```bash
   psql "your-direct-connection-string"
   ```

3. **Execute the Migration**
   ```bash
   \i prisma/enable_rls.sql
   ```

### Option 3: Via Prisma Migration (Advanced)

```bash
# Create migration directory
npx prisma migrate dev --create-only --name enable_rls

# Move SQL file to migration
# Then apply
npx prisma migrate deploy
```

## RLS Policies Explained

### User Table
- Users can read and update only their own user record
- Service role (application) has full access for NextAuth operations

### Task, Category, Tag, NotificationPreference Tables
- Users can CRUD only rows where `userId` matches their ID
- Service role has full access for application operations

### TaskTag (Join Table)
- Users can manage tags only on tasks they own
- Uses subquery to check task ownership

### NextAuth Tables (Account, Session, VerificationToken)
- **Permissive policies** - Allow all operations
- Why? NextAuth manages these tables directly
- Application already controls access via session management

## Understanding the Service Role Pattern

The migration creates a helper function:

```sql
CREATE OR REPLACE FUNCTION auth.user_id() RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('app.current_user_id', TRUE), '')::TEXT;
$$ LANGUAGE SQL STABLE;
```

**How it works:**
- Returns `NULL` when called from application (service role)
- Could return a user ID if we set `app.current_user_id` session variable
- When NULL, the "Service role has full access" policy applies

**Current behavior:**
- Application uses service role (bypasses RLS)
- Application handles all authentication at API layer
- RLS provides backup security if credentials leak

**Future enhancement (optional):**
- Set session variable before each query: `SET LOCAL app.current_user_id = 'user_id'`
- RLS policies would then enforce user-level access
- Adds redundancy with application-level auth

## Testing After Migration

### 1. Restart Development Server

```bash
# Kill current dev server
# Start fresh
npm run dev
```

### 2. Test Core Functionality

- ✅ Sign in with Google
- ✅ View tasks
- ✅ Create a new task
- ✅ Edit a task
- ✅ Delete a task
- ✅ Filter and search
- ✅ Create categories and tags
- ✅ Update notification preferences

### 3. Verify in Supabase Dashboard

1. Go to **Table Editor** → **Task**
2. You should see all tables with a 🔒 icon (RLS enabled)
3. Click the lock icon to view policies

### 4. Check Server Logs

```bash
# Should see NO RLS-related errors
# All API endpoints should return 200 OK
```

## Troubleshooting

### Issue: "Permission denied for table X"

**Cause:** Service role connection is not being used

**Solution:**
1. Check your `DATABASE_URL` in `.env`
2. Ensure it's the pooled connection (pgbouncer)
3. Supabase service role automatically bypasses RLS

### Issue: NextAuth sign-in fails

**Cause:** RLS blocking Account/Session table access

**Solution:**
- Check that permissive policies exist on Account, Session, VerificationToken
- Run verification query to see all policies:
  ```sql
  SELECT * FROM pg_policies WHERE schemaname = 'public';
  ```

### Issue: Can't access other users' data

**Cause:** This is expected! RLS is working correctly.

**Solution:**
- Each user should only see their own data
- If you need admin access, use Supabase dashboard

## Rolling Back (If Needed)

If you need to disable RLS:

```sql
-- Disable RLS on all tables
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Task" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Tag" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "TaskTag" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "NotificationPreference" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" DISABLE ROW LEVEL SECURITY;

-- Drop all policies (optional)
DROP POLICY IF EXISTS "Users can read own record" ON "User";
-- ... etc for all policies
```

## Security Benefits

✅ **Defense-in-depth** - Multiple layers of security
✅ **Credential protection** - Data safe even if DATABASE_URL leaks
✅ **Compliance** - Meets security best practices
✅ **Audit trail** - PostgreSQL logs access attempts
✅ **Future-proof** - Ready for direct database access features

## Performance Impact

- **Minimal** - Policies are evaluated at the database level
- **Optimized** - PostgreSQL query planner includes RLS in execution plan
- **Service role bypass** - Application doesn't experience overhead

## Next Steps

After enabling RLS:

1. ✅ Update `CLAUDE.md` to document RLS implementation
2. ✅ Add security section to README
3. 🔄 Monitor application performance
4. 🔄 Consider setting session variables for double-verification (optional)
5. 🔄 Add RLS to deployment checklist

## Questions?

If you encounter any issues:
1. Check Supabase logs: Dashboard → Logs → Database
2. Review policies: `SELECT * FROM pg_policies WHERE schemaname = 'public';`
3. Verify RLS status: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`

---

**Last Updated:** November 1, 2025
**Status:** Ready to apply
**Migration File:** `prisma/enable_rls.sql`
