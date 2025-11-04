'use client';

import { useEffect, useRef } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useOnboarding } from '@/lib/hooks/useOnboarding';
import { toast } from 'sonner';

interface WelcomeTourProps {
  run?: boolean;
  onComplete?: () => void;
}

export function WelcomeTour({ run: runProp, onComplete }: WelcomeTourProps) {
  const { needsOnboarding, completeTour, isLoading } = useOnboarding();
  const driverInstanceRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Don't run if loading or if explicitly set to not run
    if (isLoading || runProp === false) {
      return;
    }

    // Safety check: Don't run tour if user has explicitly disabled it
    const tourDisabled = localStorage.getItem('duesync-tour-disabled');
    if (tourDisabled === 'true') {
      return;
    }

    // Safety check: Prevent tour from running more than once per session
    const tourShownThisSession = sessionStorage.getItem('duesync-tour-shown');
    if (tourShownThisSession === 'true' && runProp === undefined) {
      return;
    }

    // Determine if we should run the tour
    const shouldRun = runProp !== undefined ? runProp : needsOnboarding;

    if (!shouldRun) {
      return;
    }

    // Mark tour as shown this session to prevent duplicates
    sessionStorage.setItem('duesync-tour-shown', 'true');

    // Clean up any existing tour
    if (driverInstanceRef.current) {
      driverInstanceRef.current.destroy();
      driverInstanceRef.current = null;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Small delay to ensure all elements are rendered
    timeoutRef.current = setTimeout(() => {
      try {
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
                  "You're now ready to start managing your tasks like a pro. Happy organizing! <br/><br/><small>Tip: You can always restart this tour from Settings → Profile → Resume Tour</small><br/><br/><button id='disable-tour-btn' style='background: none; border: 1px solid #ccc; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-top: 8px;'>Don't show this tour again</button>",
              },
            },
          ],
          nextBtnText: 'Next →',
          prevBtnText: '← Back',
          doneBtnText: 'Finish',
          progressText: 'Step {{current}} of {{total}}',
          onDeselected: () => {
            if (driverInstanceRef.current) {
              // Call custom cleanup if available
              if (cleanupRef.current) {
                cleanupRef.current();
                cleanupRef.current = null;
              }
              driverInstanceRef.current.destroy();
              driverInstanceRef.current = null;
            }
          },
          onDestroyStarted: (element, step, options) => {
            const wasCompleted = options.state.activeIndex === options.config.steps.length - 1;
            const wasSkipped = !wasCompleted;

            try {
              // Call completeTour with stable function reference
              completeTour(wasSkipped);

              // Fallback: Store completion status in localStorage if API fails
              const completionData = {
                completed: true,
                skipped: wasSkipped,
                timestamp: new Date().toISOString(),
              };
              localStorage.setItem('duesync-onboarding-completed', JSON.stringify(completionData));
            } catch (error) {
              console.error('[WelcomeTour] Failed to save completion status:', error);
              // Still store in localStorage as fallback
              const completionData = {
                completed: true,
                skipped: wasSkipped,
                timestamp: new Date().toISOString(),
                error: true,
              };
              localStorage.setItem('duesync-onboarding-completed', JSON.stringify(completionData));
            }

            if (onComplete) {
              try {
                onComplete();
              } catch (error) {
                console.error('[WelcomeTour] onComplete callback failed:', error);
              }
            }

            if (process.env.NODE_ENV === 'development') {
              console.log('[WelcomeTour] Tour ended:', wasSkipped ? 'skipped' : 'completed');
            }

            // Destroy the tour overlay immediately
            driverObj.destroy();
            driverInstanceRef.current = null;

            // Clean up event listeners
            if (cleanupRef.current) {
              cleanupRef.current();
              cleanupRef.current = null;
            }
          },
        });

        // Store reference for cleanup
        driverInstanceRef.current = driverObj;

        // Add event listener for "Don't show again" button
        const handleDisableTour = () => {
          localStorage.setItem('duesync-tour-disabled', 'true');
          driverObj.destroy();
          driverInstanceRef.current = null;
          toast.info('Tour disabled. You can re-enable it from Settings.');
        };

        // Listen for the button click (will be available when the last step is shown)
        const disableBtnCheck = setInterval(() => {
          const disableBtn = document.getElementById('disable-tour-btn');
          if (disableBtn) {
            disableBtn.addEventListener('click', handleDisableTour);
            clearInterval(disableBtnCheck);
          }
        }, 100);

        // Clean up the interval if tour is destroyed
        const cleanup = () => {
          clearInterval(disableBtnCheck);
          const disableBtn = document.getElementById('disable-tour-btn');
          if (disableBtn) {
            disableBtn.removeEventListener('click', handleDisableTour);
          }
        };

        // Store cleanup function in ref
        cleanupRef.current = cleanup;

        // Start the tour
        driverObj.drive();
      } catch (error) {
        console.error('[WelcomeTour] Failed to initialize tour:', error);
      }
    }, 500);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }

      if (driverInstanceRef.current) {
        // Call custom cleanup if available
        if (cleanupRef.current) {
          cleanupRef.current();
          cleanupRef.current = null;
        }
        driverInstanceRef.current.destroy();
        driverInstanceRef.current = null;
      }
    };
  }, [needsOnboarding, isLoading, runProp]); // Removed completeTour and onComplete from dependencies

  // This component doesn't render anything - it just controls the tour
  return null;
}
