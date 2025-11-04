-- Enable Row Level Security (RLS) for DueSync Database
-- This migration enables RLS on all tables and creates appropriate policies
--
-- IMPORTANT: This uses a service-role approach where the application bypasses RLS
-- The application handles authentication at the API layer
-- RLS provides defense-in-depth security

-- ============================================================================
-- HELPER FUNCTION: Get current authenticated user ID from session variable
-- ============================================================================
-- This function retrieves the user ID set by the application
-- The app should set this via: SET LOCAL app.current_user_id = 'user_id';
-- Note: Using public schema since auth schema is protected in Supabase

CREATE OR REPLACE FUNCTION public.current_user_id() RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('app.current_user_id', TRUE), '')::TEXT;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- USER TABLE
-- ============================================================================
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own record
CREATE POLICY "Users can read own record"
  ON "User"
  FOR SELECT
  USING (id = public.current_user_id());

-- Policy: Users can update their own record
CREATE POLICY "Users can update own record"
  ON "User"
  FOR UPDATE
  USING (id = public.current_user_id());

-- Policy: Service role can do everything (for NextAuth operations)
CREATE POLICY "Service role has full access to User"
  ON "User"
  FOR ALL
  USING (public.current_user_id() IS NULL);

-- ============================================================================
-- TASK TABLE
-- ============================================================================
ALTER TABLE "Task" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own tasks
CREATE POLICY "Users can view own tasks"
  ON "Task"
  FOR SELECT
  USING ("userId" = public.current_user_id());

-- Policy: Users can create their own tasks
CREATE POLICY "Users can create own tasks"
  ON "Task"
  FOR INSERT
  WITH CHECK ("userId" = public.current_user_id());

-- Policy: Users can update their own tasks
CREATE POLICY "Users can update own tasks"
  ON "Task"
  FOR UPDATE
  USING ("userId" = public.current_user_id());

-- Policy: Users can delete their own tasks
CREATE POLICY "Users can delete own tasks"
  ON "Task"
  FOR DELETE
  USING ("userId" = public.current_user_id());

-- Policy: Service role has full access
CREATE POLICY "Service role has full access to Task"
  ON "Task"
  FOR ALL
  USING (public.current_user_id() IS NULL);

-- ============================================================================
-- CATEGORY TABLE
-- ============================================================================
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own categories
CREATE POLICY "Users can view own categories"
  ON "Category"
  FOR SELECT
  USING ("userId" = public.current_user_id());

-- Policy: Users can create their own categories
CREATE POLICY "Users can create own categories"
  ON "Category"
  FOR INSERT
  WITH CHECK ("userId" = public.current_user_id());

-- Policy: Users can update their own categories
CREATE POLICY "Users can update own categories"
  ON "Category"
  FOR UPDATE
  USING ("userId" = public.current_user_id());

-- Policy: Users can delete their own categories
CREATE POLICY "Users can delete own categories"
  ON "Category"
  FOR DELETE
  USING ("userId" = public.current_user_id());

-- Policy: Service role has full access
CREATE POLICY "Service role has full access to Category"
  ON "Category"
  FOR ALL
  USING (public.current_user_id() IS NULL);

-- ============================================================================
-- TAG TABLE
-- ============================================================================
ALTER TABLE "Tag" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own tags
CREATE POLICY "Users can view own tags"
  ON "Tag"
  FOR SELECT
  USING ("userId" = public.current_user_id());

-- Policy: Users can create their own tags
CREATE POLICY "Users can create own tags"
  ON "Tag"
  FOR INSERT
  WITH CHECK ("userId" = public.current_user_id());

-- Policy: Users can update their own tags
CREATE POLICY "Users can update own tags"
  ON "Tag"
  FOR UPDATE
  USING ("userId" = public.current_user_id());

-- Policy: Users can delete their own tags
CREATE POLICY "Users can delete own tags"
  ON "Tag"
  FOR DELETE
  USING ("userId" = public.current_user_id());

-- Policy: Service role has full access
CREATE POLICY "Service role has full access to Tag"
  ON "Tag"
  FOR ALL
  USING (public.current_user_id() IS NULL);

-- ============================================================================
-- TASKTAG TABLE (Join table)
-- ============================================================================
ALTER TABLE "TaskTag" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view tags on their own tasks
CREATE POLICY "Users can view tags on own tasks"
  ON "TaskTag"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Task"
      WHERE "Task".id = "TaskTag"."taskId"
      AND "Task"."userId" = public.current_user_id()
    )
  );

-- Policy: Users can add tags to their own tasks
CREATE POLICY "Users can add tags to own tasks"
  ON "TaskTag"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Task"
      WHERE "Task".id = "TaskTag"."taskId"
      AND "Task"."userId" = public.current_user_id()
    )
  );

-- Policy: Users can remove tags from their own tasks
CREATE POLICY "Users can remove tags from own tasks"
  ON "TaskTag"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "Task"
      WHERE "Task".id = "TaskTag"."taskId"
      AND "Task"."userId" = public.current_user_id()
    )
  );

-- Policy: Service role has full access
CREATE POLICY "Service role has full access to TaskTag"
  ON "TaskTag"
  FOR ALL
  USING (public.current_user_id() IS NULL);

-- ============================================================================
-- NOTIFICATIONPREFERENCE TABLE
-- ============================================================================
ALTER TABLE "NotificationPreference" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notification preferences
CREATE POLICY "Users can view own notification preferences"
  ON "NotificationPreference"
  FOR SELECT
  USING ("userId" = public.current_user_id());

-- Policy: Users can create their own notification preferences
CREATE POLICY "Users can create own notification preferences"
  ON "NotificationPreference"
  FOR INSERT
  WITH CHECK ("userId" = public.current_user_id());

-- Policy: Users can update their own notification preferences
CREATE POLICY "Users can update own notification preferences"
  ON "NotificationPreference"
  FOR UPDATE
  USING ("userId" = public.current_user_id());

-- Policy: Users can delete their own notification preferences
CREATE POLICY "Users can delete own notification preferences"
  ON "NotificationPreference"
  FOR DELETE
  USING ("userId" = public.current_user_id());

-- Policy: Service role has full access
CREATE POLICY "Service role has full access to NotificationPreference"
  ON "NotificationPreference"
  FOR ALL
  USING (public.current_user_id() IS NULL);

-- ============================================================================
-- NEXTAUTH TABLES - Account, Session, VerificationToken
-- These tables are managed by NextAuth and need permissive access
-- ============================================================================

-- ACCOUNT TABLE
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations (NextAuth manages these)
-- The app handles authentication, so these need to be accessible
CREATE POLICY "Allow all operations on Account"
  ON "Account"
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- SESSION TABLE
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations (NextAuth manages these)
CREATE POLICY "Allow all operations on Session"
  ON "Session"
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- VERIFICATIONTOKEN TABLE
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations (NextAuth manages these)
CREATE POLICY "Allow all operations on VerificationToken"
  ON "VerificationToken"
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- List all tables with RLS enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('User', 'Task', 'Category', 'Tag', 'TaskTag', 'NotificationPreference', 'Account', 'Session', 'VerificationToken')
ORDER BY tablename;

-- List all RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
