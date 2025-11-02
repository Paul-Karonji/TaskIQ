# Quick Guide: Apply Row Level Security (RLS)

## TL;DR - 3 Steps to Enable RLS

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your TaskIQ project
3. Click "SQL Editor" → "New query"

### Step 2: Run the Migration
1. Open `prisma/enable_rls.sql` in your code editor
2. Copy the entire file contents
3. Paste into Supabase SQL Editor
4. Click "Run" (or press Ctrl+Enter)

### Step 3: Verify
Look at the results - you should see:
- 9 tables with `rowsecurity = true`
- List of all policies created

## That's It!

The application will continue working normally because:
- ✅ It uses service role (bypasses RLS)
- ✅ Application-level auth still works
- 🛡️ RLS adds defense-in-depth security

## Test Your Application

After applying:
1. Sign in to http://localhost:3001
2. Create/view/edit/delete tasks
3. Everything should work exactly as before
4. Supabase warnings should be gone!

## Need More Details?

See `docs/RLS_IMPLEMENTATION.md` for comprehensive guide.

## Rollback (if needed)

If something breaks:
```sql
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Task" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Tag" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "TaskTag" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "NotificationPreference" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" DISABLE ROW LEVEL SECURITY;
```

Run this in Supabase SQL Editor to disable RLS.
