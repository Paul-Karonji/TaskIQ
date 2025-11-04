'use client';

/*
import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useOnboarding } from '@/lib/hooks/useOnboarding';

interface WelcomeTourProps {
  run?: boolean;
  onComplete?: () => void;
}

export function WelcomeTour({ run: runProp, onComplete }: WelcomeTourProps) {
  const { needsOnboarding, completeTour, isLoading } = useOnboarding();

  useEffect(() => {
    // Don't run if loading or if explicitly set to not run
    if (isLoading || runProp === false) {
      return;
    }

    // Determine if we should run the tour
    const shouldRun = runProp !== undefined ? runProp : needsOnboarding;

    if (!shouldRun) {
      return;
    }

    // Small delay to ensure all elements are rendered
    const timer = setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        showButtons: ['next', 'previous', 'close'],
        steps: [
          {
            popover: {
              title: 'Welcome to DueSync! 👋',
              description:
                "Your intelligent task management companion. Let's take a quick 2-minute tour to help you get started. You can skip this tour anytime and resume it later from Settings.",
            },
          },
          {
            element: '[data-tour="quick-add-task"]',
            popover: {
              title: 'Create Your First Task',
              description:
                'Click here to add tasks with priorities, due dates, estimated time, categories, and tags. It\'s quick and easy!',
              side: 'bottom',
            },
          },
          {
            element: '[data-tour="filters"]',
            popover: {
              title: 'Find Tasks Quickly',
              description:
                'Filter tasks by status, priority, or search by keyword. Perfect for staying organized when you have many tasks.',
              side: 'right',
            },
          },
          {
            element: '[data-tour="manage-categories"]',
            popover: {
              title: 'Organize with Categories & Tags',
              description:
                'Create categories and tags to organize tasks your way. Color-code them for easy visual identification.',
              side: 'bottom',
            },
          },
          {
            element: '[data-tour="focus-mode"]',
            popover: {
              title: 'Stay Focused',
              description:
                'Enter Focus Mode for a distraction-free view of today\'s tasks with an optional Pomodoro timer to boost productivity.',
              side: 'bottom',
            },
          },
          {
            element: '[data-tour="priority-queue"]',
            popover: {
              title: 'Priority Queue',
              description:
                'Your most urgent tasks, automatically sorted by priority and due date. Always know what to tackle next!',
              side: 'left',
            },
          },
          {
            element: '[data-tour="settings"]',
            popover: {
              title: 'Customize Your Experience',
              description:
                'Access settings to manage your profile, timezone, connected accounts, notification preferences, and more.',
              side: 'bottom',
            },
          },
          {
            popover: {
              title: "You're All Set! 🎉",
              description:
                "You're now ready to start managing your tasks like a pro. Happy organizing! <br/><br/><small>Tip: You can always restart this tour from Settings → Profile → Resume Tour</small>",
            },
          },
        ],
        nextBtnText: 'Next →',
        prevBtnText: '← Back',
        doneBtnText: 'Finish',
        progressText: 'Step {{current}} of {{total}}',
        onDeselected: () => {
          driverObj.destroy();
        },
        onDestroyStarted: (element, step, options) => {
          const wasCompleted = options.state.activeIndex === options.config.steps.length - 1;
          const wasSkipped = !wasCompleted;

          completeTour(wasSkipped);

          if (onComplete) {
            onComplete();
          }

          if (process.env.NODE_ENV === 'development') {
            console.log('[WelcomeTour] Tour ended:', wasSkipped ? 'skipped' : 'completed');
          }
        },

      });

      // Start the tour
      driverObj.drive();
    }, 500);

    return () => clearTimeout(timer);
  }, [needsOnboarding, isLoading, runProp, completeTour, onComplete]);

  // This component doesn't render anything - it just controls the tour
  return null;
}
*/

// Welcome Tour component disabled - commented out
export function WelcomeTour() {
  return null;
}
