# Prisma Baseline Migration Guide

## Overview

This guide explains how to create a baseline migration for an existing DueSync database. This is necessary for tracking database schema changes in production and enabling safe schema updates.

## Why You Need a Baseline Migration

When deploying to production, Prisma Migrate needs a starting point to track changes. Since the database schema already exists, we create a "baseline" migration that represents the current state.

## Prerequisites

- Database must be accessible
- DATABASE_URL and DIRECT_URL configured in .env
- Prisma schema matches current database state

## Step 1: Create Baseline Migration

Since the database schema already exists, we'll create a migration file and mark it as already applied:

```bash
# Create the migration directory and files (without applying to database)
npx prisma migrate dev --create-only --name baseline_migration
```

This will create a new migration in `prisma/migrations/` with SQL that represents your current schema.

## Step 2: Mark Migration as Applied

Since your database already has these tables, mark the migration as applied without running it:

```bash
npx prisma migrate resolve --applied baseline_migration
```

This tells Prisma "this migration has already been applied to the database."

## Step 3: Verify Migration Status

Check that everything is in sync:

```bash
npx prisma migrate status
```

You should see:
```
✓ Database schema is up to date!
```

## Alternative Approach: Reset and Migrate

**⚠️ WARNING: This will DELETE ALL DATA**

Only use this in development environments:

```bash
# Reset database and apply all migrations
npx prisma migrate reset
```

## For Production Deployment

When deploying to production:

1. **First Deployment** (new database):
   ```bash
   npx prisma migrate deploy
   ```

2. **Existing Database** (with data):
   - Backup your database first
   - Create baseline migration as described above
   - Then use `prisma migrate deploy` for future updates

## Troubleshooting

### "Drift Detected" Error

This means your database schema differs from migrations. Solutions:

1. **For development**: Use `prisma db push` instead of migrations
2. **For production**: Create baseline migration as described above

### Connection Issues

If you get "Can't reach database server" errors:

1. Verify DATABASE_URL is correct
2. Check database is accessible (not paused/sleeping)
3. Ensure network access to database
4. For Supabase: Use connection pooler port 6543 for DATABASE_URL, port 5432 for DIRECT_URL

### Schema Mismatch

If schema doesn't match database:

```bash
# Pull current schema from database
npx prisma db pull

# Review changes in prisma/schema.prisma
# Then create a new migration if needed
npx prisma migrate dev --name describe_your_changes
```

## Best Practices

1. **Version Control**: Always commit migrations to git
2. **Never Edit**: Don't manually edit migration SQL files after creation
3. **Production Safety**: Always test migrations in staging first
4. **Backups**: Backup production database before running migrations
5. **Rollback Plan**: Have a plan to restore from backup if needed

## Migration Workflow

### Development
```bash
# Make schema changes in prisma/schema.prisma
npx prisma migrate dev --name describe_changes

# This will:
# 1. Create migration file
# 2. Apply to database
# 3. Regenerate Prisma Client
```

### Production
```bash
# Deploy pending migrations
npx prisma migrate deploy

# This will:
# 1. Apply all pending migrations
# 2. NOT regenerate Prisma Client (use npx prisma generate)
```

## Current Schema State

DueSync database includes:

**Models:**
- User
- Account (NextAuth)
- Session (NextAuth)
- VerificationToken (NextAuth)
- Task
- Category
- Tag
- TaskTag (join table)
- NotificationPreference

**Enums:**
- Priority (HIGH, MEDIUM, LOW)
- Status (PENDING, COMPLETED, ARCHIVED)
- RecurringPattern (DAILY, WEEKLY, MONTHLY)
- WeekDay (MONDAY, TUESDAY, etc.)

**Key Indexes:**
- Tasks: userId+dueDate, userId+status, userId+priority, googleEventId
- Categories/Tags: Unique userId+name combinations
- Efficient query performance for common operations

## When to Run Baseline Migration

Run the baseline migration:

✅ **Before production deployment** - Establishes migration tracking
✅ **After manual schema changes** - Brings Prisma back in sync
✅ **When setting up new environment** - Ensures consistency

❌ **Don't run if:**
- Database is empty (use `prisma migrate deploy` instead)
- You'll lose important data (backup first)
- In production without testing in staging

## References

- [Prisma Migrate Documentation](https://www.prisma.io/docs/orm/prisma-migrate)
- [Troubleshooting Development](https://www.prisma.io/docs/orm/prisma-migrate/workflows/troubleshooting)
- [Baseline Existing Database](https://www.prisma.io/docs/orm/prisma-migrate/getting-started#baseline-an-existing-database)

---

**Last Updated**: November 2, 2025
