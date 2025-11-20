'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';

interface UserProfile {
  timezone: string;
  [key: string]: any;
}

/**
 * Hook to get the current user's timezone preference
 * Falls back to browser's timezone if not set or not logged in
 */
export function useTimezone() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      return response.json();
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Return user's timezone preference or browser's timezone as fallback
  const timezone = profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  return {
    timezone,
    userTimezone: profile?.timezone,
    browserTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    isUsingBrowserTimezone: !profile?.timezone,
  };
}
