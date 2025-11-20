# Contributing to DueSync

First off, thank you for considering contributing to DueSync! It's people like you that make DueSync such a great tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)
- [Testing](#testing)

## Code of Conduct

This project and everyone participating in it is governed by respect, kindness, and professionalism. By participating, you are expected to uphold these values.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18 or higher
- npm or yarn
- Git
- PostgreSQL (or a Supabase/Neon account)

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/duesync.git
   cd duesync
   ```

3. **Add the upstream repository**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/duesync.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

6. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

7. **Start the development server**:
   ```bash
   npm run dev
   ```

## Development Process

### Branching Strategy

- `main` - Production-ready code
- `feature/*` - New features (e.g., `feature/kanban-view`)
- `fix/*` - Bug fixes (e.g., `fix/calendar-sync-error`)
- `docs/*` - Documentation updates (e.g., `docs/update-readme`)
- `refactor/*` - Code refactoring (e.g., `refactor/task-api`)

### Making Changes

1. **Create a new branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit them (see [Commit Messages](#commit-messages))

3. **Keep your branch up to date**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request** on GitHub

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types - avoid `any`
- Use interfaces for object shapes
- Export types from `types/index.ts`

### React Components

- Use functional components with hooks
- Add `'use client'` directive for client components
- Keep components small and focused (single responsibility)
- Use meaningful component and variable names

### File Naming

- Components: `PascalCase.tsx` (e.g., `TaskCard.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Hooks: `useCamelCase.ts` (e.g., `useTasks.ts`)
- Types: `PascalCase.ts` or `index.ts`

### Code Style

We use ESLint and Prettier for code formatting:

```bash
npm run lint        # Check for linting errors
npm run lint:fix    # Auto-fix linting errors
```

**Key conventions:**
- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- Trailing commas in multi-line structures
- Max line length: 100 characters

### Component Structure

```tsx
'use client'; // If needed

import { useState } from 'react';
import { type ComponentProps } from '@/types';

interface Props {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: Props) {
  const [state, setState] = useState<string>('');

  // Event handlers
  const handleClick = () => {
    onAction();
  };

  // Render
  return (
    <div className="...">
      {/* Component JSX */}
    </div>
  );
}
```

### API Routes

- Use proper HTTP methods (GET, POST, PATCH, DELETE)
- Return appropriate status codes
- Validate input with Zod schemas
- Add authentication checks
- Handle errors gracefully

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = schema.parse(body);

    // Your logic here

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}
```

### Database

- Use Prisma for all database operations
- Create migrations for schema changes
- Use transactions for related operations
- Add indexes for frequently queried fields

```bash
# After modifying schema.prisma
npx prisma migrate dev --name descriptive_migration_name
```

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(tasks): add bulk task operations
fix(calendar): resolve sync error with recurring events
docs(readme): update installation instructions
refactor(api): simplify task filtering logic
```

### Best Practices

- Use the imperative mood ("add" not "added")
- Keep the subject line under 72 characters
- Reference issues in the footer: `Fixes #123`
- Explain the "why" in the body, not the "what"

## Pull Request Process

### Before Submitting

- [ ] Code follows the style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex logic
- [ ] Documentation updated if needed
- [ ] No console.log or debugging code
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Tests added/updated if applicable
- [ ] Changes tested locally

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. At least one maintainer must review
2. All CI checks must pass
3. No merge conflicts
4. Requested changes must be addressed
5. Approved PRs will be merged by maintainers

## Reporting Bugs

### Before Submitting a Bug Report

- Check existing issues to avoid duplicates
- Collect relevant information:
  - DueSync version
  - Browser/OS version
  - Steps to reproduce
  - Expected vs actual behavior

### Bug Report Template

```markdown
**Describe the bug**
Clear and concise description

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable

**Environment:**
 - OS: [e.g., macOS 13.0]
 - Browser: [e.g., Chrome 120]
 - DueSync Version: [e.g., 1.0.0]

**Additional context**
Any other relevant information
```

## Suggesting Enhancements

We welcome feature suggestions! Please:

1. Check if the feature is already requested
2. Describe the problem it solves
3. Provide use cases
4. Consider implementation complexity

### Enhancement Template

```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution you'd like**
Clear description of desired functionality

**Describe alternatives you've considered**
Other solutions you've thought about

**Additional context**
Mockups, examples, etc.
```

## Testing

### Running Tests

```bash
npm test              # Run all tests
npm test -- --watch   # Run in watch mode
npm run test:e2e      # Run end-to-end tests
```

### Writing Tests

- Write tests for new features
- Update tests for bug fixes
- Use descriptive test names
- Test edge cases and error conditions

Example:

```typescript
import { describe, it, expect } from '@jest/globals';
import { formatDate } from './utils';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2025-01-15');
    expect(formatDate(date)).toBe('Jan 15, 2025');
  });

  it('handles invalid dates', () => {
    expect(formatDate(null)).toBe('Invalid date');
  });
});
```

## Questions?

Don't hesitate to ask questions by:
- Opening a [Discussion](https://github.com/yourusername/duesync/discussions)
- Commenting on an existing issue
- Reaching out to maintainers

---

Thank you for contributing to DueSync! 🎉
