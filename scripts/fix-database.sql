-- Fix Database Issues for DueSync
-- Run this in Supabase SQL Editor

-- ==========================================
-- STEP 1: Disable RLS (Row-Level Security)
-- ==========================================
-- RLS should be disabled when using NextAuth instead of Supabase Auth

ALTER TABLE "Task" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Tag" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "TaskTag" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "NotificationPreference" DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- STEP 2: Verify RLS is disabled
-- ==========================================

SELECT
    schemaname,
    tablename,
    rowsecurity,
    CASE
        WHEN rowsecurity THEN '❌ RLS ENABLED (BAD)'
        ELSE '✅ RLS DISABLED (GOOD)'
    END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('Task', 'User', 'Account', 'Session', 'Category', 'Tag', 'TaskTag', 'NotificationPreference')
ORDER BY tablename;

-- ==========================================
-- STEP 3: Check User-Task Relationships
-- ==========================================

SELECT
    u.id as user_id,
    u.email,
    u.name,
    COUNT(t.id) as total_tasks,
    COUNT(CASE WHEN t.status = 'PENDING' THEN 1 END) as pending_tasks,
    COUNT(CASE WHEN t.status = 'COMPLETED' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN t.status = 'ARCHIVED' THEN 1 END) as archived_tasks
FROM "User" u
LEFT JOIN "Task" t ON t."userId" = u.id
GROUP BY u.id, u.email, u.name
ORDER BY total_tasks DESC;

-- ==========================================
-- STEP 4: Check for Orphaned Tasks
-- ==========================================

SELECT
    t.id as task_id,
    t.title,
    t."userId",
    t.status,
    t."createdAt",
    CASE
        WHEN u.id IS NULL THEN '❌ ORPHANED (no user found)'
        ELSE '✅ Valid user'
    END as user_status
FROM "Task" t
LEFT JOIN "User" u ON t."userId" = u.id
ORDER BY t."createdAt" DESC
LIMIT 20;

-- ==========================================
-- STEP 5: (OPTIONAL) Fix User ID Mismatches
-- ==========================================
-- Only run this if you need to reassign tasks to a different user
-- Replace 'correct_user_id' with your actual user ID

-- First, find your correct user ID:
-- SELECT id, email FROM "User" WHERE email = 'your-email@example.com';

-- Then uncomment and run this to reassign tasks:
-- UPDATE "Task"
-- SET "userId" = 'correct_user_id'
-- WHERE "userId" = 'old_user_id';

-- ==========================================
-- STEP 6: Verify Data
-- ==========================================

-- Check recent tasks
SELECT
    t.id,
    t.title,
    t."userId",
    u.email as user_email,
    t.status,
    t.priority,
    t."dueDate",
    t."createdAt"
FROM "Task" t
LEFT JOIN "User" u ON t."userId" = u.id
ORDER BY t."createdAt" DESC
LIMIT 10;

-- ==========================================
-- DONE!
-- ==========================================
-- After running this:
-- 1. Go to https://duesync.vercel.app/api/debug/tasks
-- 2. Verify your user ID matches the tasks
-- 3. Reload your dashboard
-- 4. Tasks should now appear!
