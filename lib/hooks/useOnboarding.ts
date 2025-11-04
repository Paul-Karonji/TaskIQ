/*
// Custom hook for managing user onboarding state
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { OnboardingStatus, OnboardingUpdateInput } from '@/types';

export function useOnboarding() {
  const queryClient = useQueryClient();

  // Fetch onboarding status
  const {
    data: onboardingStatus,
    isLoading,
    error,
  } = useQuery<OnboardingStatus>({
    queryKey: ['onboarding'],
    queryFn: async () => {
      const res = await fetch('/api/user/onboarding');
      if (!res.ok) {
        throw new Error('Failed to fetch onboarding status');
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Complete tour mutation
  const completeTourMutation = useMutation({
    mutationFn: async (skipped: boolean = false) => {
      const res = await fetch('/api/user/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hasCompletedOnboarding: true,
          onboardingSkipped: skipped,
        } as OnboardingUpdateInput),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update onboarding');
      }

      return res.json();
    },
    onSuccess: (data, skipped) => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'], exact: false });

      if (skipped) {
        toast.info('You can resume the tour anytime from Settings');
      } else {
        toast.success('Welcome to DueSync! 🎉');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update onboarding status');
    },
  });

  // Reset onboarding (for resuming tour)
  const resetOnboardingMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/user/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hasCompletedOnboarding: false,
          onboardingSkipped: false,
        } as OnboardingUpdateInput),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to reset onboarding');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'], exact: false });
      toast.success('Tour restarted! Refresh the page to see it.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to restart tour');
    },
  });

  // Return mutation functions directly - they're already stable from React Query
  return {
    // State
    needsOnboarding: onboardingStatus?.hasCompletedOnboarding === false,
    onboardingStatus,
    isLoading,
    error,

    // Actions - stable function references that won't cause re-render loops
    completeTour: (skipped?: boolean) => completeTourMutation.mutate(skipped),
    resetOnboarding: () => resetOnboardingMutation.mutate(),

    // Mutation states
    isCompletingTour: completeTourMutation.isPending,
    isResettingOnboarding: resetOnboardingMutation.isPending,
  };
}
*/

// useOnboarding hook disabled - commented out
export function useOnboarding() {
  return {
    needsOnboarding: false,
    onboardingStatus: null,
    isLoading: false,
    error: null,
    completeTour: () => {},
    resetOnboarding: () => {},
    isCompletingTour: false,
    isResettingOnboarding: false,
  };
}
