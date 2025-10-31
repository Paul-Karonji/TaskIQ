'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

/**
 * ThemeToggle Component
 *
 * NOTE: Dark mode is currently DISABLED app-wide (October 2025)
 *
 * Reason: Only ~30% of components have proper dark mode styling.
 * Most components use hardcoded light colors causing text visibility issues.
 *
 * Status: Theme infrastructure is complete, but component library needs work.
 *
 * To re-enable dark mode:
 * 1. Add dark: variants to all components in components/ui/
 * 2. Add dark: variants to all components in components/tasks/
 * 3. Update TaskCard, TaskDashboard, QuickAddTask (most critical)
 * 4. Test thoroughly in both themes
 * 5. Restore ThemeToggle to app/page.tsx
 * 6. Change ThemeProvider defaultTheme back to "system" with enableSystem
 *
 * Estimated effort: 17-23 hours
 * See: docs/DARK_MODE_IMPLEMENTATION.md (when created)
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
      ) : (
        <Moon className="h-5 w-5 text-gray-600 hover:text-gray-900 transition-colors" />
      )}
    </Button>
  );
}
