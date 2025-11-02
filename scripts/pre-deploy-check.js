#!/usr/bin/env node

/**
 * Pre-Deployment Checklist Script
 *
 * Run this before deploying to production to ensure everything is ready.
 *
 * Usage: node scripts/pre-deploy-check.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

// Helper functions
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.bold}${msg}${colors.reset}`),
};

let hasErrors = false;
let hasWarnings = false;

// Check functions
const checks = {
  // Check if .env file exists
  envFile: () => {
    log.section('1. Environment Configuration');
    const envPath = path.join(__dirname, '..', '.env');

    if (fs.existsSync(envPath)) {
      log.success('.env file exists');

      // Check for required variables
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const requiredVars = [
        'DATABASE_URL',
        'DIRECT_URL',
        'NEXTAUTH_URL',
        'NEXTAUTH_SECRET',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'RESEND_API_KEY',
        'RESEND_FROM_EMAIL',
        'UPSTASH_REDIS_REST_URL',
        'UPSTASH_REDIS_REST_TOKEN',
        'CRON_SECRET',
        'VAPID_PUBLIC_KEY',
        'VAPID_PRIVATE_KEY',
      ];

      const missingVars = requiredVars.filter(varName => {
        return !envContent.includes(`${varName}=`);
      });

      if (missingVars.length > 0) {
        log.error(`Missing required environment variables: ${missingVars.join(', ')}`);
        hasErrors = true;
      } else {
        log.success('All required environment variables present');
      }

      // Check if using localhost URLs (development mode)
      if (envContent.includes('localhost:3000')) {
        log.warning('NEXTAUTH_URL is set to localhost - update for production');
        hasWarnings = true;
      }

    } else {
      log.error('.env file not found');
      hasErrors = true;
    }
  },

  // Check Git status
  gitStatus: () => {
    log.section('2. Git Repository');
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf-8' });

      if (status.trim()) {
        log.warning('You have uncommitted changes:');
        console.log(status);
        hasWarnings = true;
      } else {
        log.success('Working directory is clean');
      }

      // Check current branch
      const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
      log.info(`Current branch: ${branch}`);

      if (branch !== 'main' && branch !== 'master') {
        log.warning(`Not on main branch. Consider merging to main before deploying.`);
      }

    } catch (error) {
      log.error('Git error: ' + error.message);
      hasErrors = true;
    }
  },

  // Check dependencies
  dependencies: () => {
    log.section('3. Dependencies');
    try {
      // Check for package-lock.json
      if (fs.existsSync(path.join(__dirname, '..', 'package-lock.json'))) {
        log.success('package-lock.json exists');
      } else {
        log.warning('package-lock.json not found - run npm install');
        hasWarnings = true;
      }

      // Check for security vulnerabilities
      log.info('Checking for security vulnerabilities...');
      try {
        execSync('npm audit --audit-level=high', { stdio: 'inherit' });
        log.success('No high/critical vulnerabilities found');
      } catch (error) {
        log.warning('Security vulnerabilities detected - review and fix');
        hasWarnings = true;
      }

    } catch (error) {
      log.error('Dependency check failed: ' + error.message);
      hasErrors = true;
    }
  },

  // Check TypeScript
  typescript: () => {
    log.section('4. TypeScript Type Checking');
    try {
      execSync('npx tsc --noEmit', { stdio: 'inherit' });
      log.success('No TypeScript errors');
    } catch (error) {
      log.error('TypeScript errors found - fix before deploying');
      hasErrors = true;
    }
  },

  // Check build
  build: () => {
    log.section('5. Production Build');
    log.info('Building for production (this may take a few minutes)...');
    try {
      execSync('npm run build', { stdio: 'inherit' });
      log.success('Production build successful');
    } catch (error) {
      log.error('Build failed - fix errors before deploying');
      hasErrors = true;
    }
  },

  // Check Prisma
  prisma: () => {
    log.section('6. Database & Prisma');
    try {
      // Check if Prisma client is generated
      const prismaClientPath = path.join(__dirname, '..', 'node_modules', '.prisma', 'client');
      if (fs.existsSync(prismaClientPath)) {
        log.success('Prisma client is generated');
      } else {
        log.warning('Prisma client not generated - run npx prisma generate');
        hasWarnings = true;
      }

      // Check migrations
      log.info('Checking Prisma migrations...');
      try {
        execSync('npx prisma migrate status', { stdio: 'inherit' });
        log.success('All migrations applied');
      } catch (error) {
        log.warning('Unapplied migrations detected - run npx prisma migrate deploy');
        hasWarnings = true;
      }

    } catch (error) {
      log.error('Prisma check failed: ' + error.message);
      hasErrors = true;
    }
  },

  // Check documentation
  documentation: () => {
    log.section('7. Documentation');
    const docsToCheck = [
      'README.md',
      'CLAUDE.md',
      'DEPLOYMENT_GUIDE.md',
      '.env.example',
      '.env.production',
    ];

    docsToCheck.forEach(doc => {
      const docPath = path.join(__dirname, '..', doc);
      if (fs.existsSync(docPath)) {
        log.success(`${doc} exists`);
      } else {
        log.warning(`${doc} not found`);
        hasWarnings = true;
      }
    });
  },

  // Security checks
  security: () => {
    log.section('8. Security Configuration');

    // Check .gitignore
    const gitignorePath = path.join(__dirname, '..', '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignore = fs.readFileSync(gitignorePath, 'utf-8');

      const requiredIgnores = ['.env', '.env.local', 'node_modules'];
      const missingIgnores = requiredIgnores.filter(pattern => !gitignore.includes(pattern));

      if (missingIgnores.length > 0) {
        log.error(`.gitignore missing patterns: ${missingIgnores.join(', ')}`);
        hasErrors = true;
      } else {
        log.success('.gitignore properly configured');
      }
    } else {
      log.error('.gitignore not found');
      hasErrors = true;
    }

    // Check if .env is committed (it shouldn't be)
    try {
      const trackedFiles = execSync('git ls-files', { encoding: 'utf-8' });
      if (trackedFiles.includes('.env\n') && !trackedFiles.includes('.env.example')) {
        log.error('.env is tracked by Git - this is a security risk!');
        hasErrors = true;
      } else {
        log.success('.env is not tracked by Git');
      }
    } catch (error) {
      log.warning('Could not check Git tracked files');
    }

    // Check vercel.json for cron configuration
    const vercelConfigPath = path.join(__dirname, '..', 'vercel.json');
    if (fs.existsSync(vercelConfigPath)) {
      log.success('vercel.json exists (cron jobs configured)');
    } else {
      log.warning('vercel.json not found - cron jobs may not run');
      hasWarnings = true;
    }
  },

  // Production readiness
  productionReadiness: () => {
    log.section('9. Production Readiness');

    const reminders = [
      'Update NEXTAUTH_URL to production domain',
      'Update GOOGLE_REDIRECT_URI to production callback',
      'Generate new NEXTAUTH_SECRET for production',
      'Generate new CRON_SECRET for production',
      'Verify domain in Resend',
      'Add production URL to Google OAuth',
      'Create production Redis database',
      'Run database migrations on production',
      'Configure cron jobs on hosting platform',
      'Set up error monitoring (Sentry)',
      'Set up uptime monitoring',
    ];

    log.warning('PRODUCTION CHECKLIST:');
    reminders.forEach(reminder => {
      console.log(`   □ ${reminder}`);
    });
  },
};

// Main execution
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.bold}DueSync - Pre-Deployment Checklist${colors.reset}`);
  console.log('='.repeat(60));

  // Run all checks
  checks.envFile();
  checks.gitStatus();
  checks.dependencies();
  checks.typescript();
  checks.build();
  checks.prisma();
  checks.documentation();
  checks.security();
  checks.productionReadiness();

  // Summary
  console.log('\n' + '='.repeat(60));
  log.section('Summary');

  if (hasErrors) {
    log.error('Pre-deployment checks FAILED - fix errors before deploying');
    console.log('\nReview the errors above and fix them before deployment.');
    process.exit(1);
  } else if (hasWarnings) {
    log.warning('Pre-deployment checks passed with WARNINGS');
    console.log('\nReview warnings above. You may proceed with deployment.');
    console.log('Make sure to complete the production checklist.');
    process.exit(0);
  } else {
    log.success('All pre-deployment checks PASSED');
    console.log('\nYour application is ready for deployment!');
    console.log('Complete the production checklist and deploy.');
    process.exit(0);
  }
}

// Run the script
main().catch(error => {
  log.error('Script failed: ' + error.message);
  process.exit(1);
});
