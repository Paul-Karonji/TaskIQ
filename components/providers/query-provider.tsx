'use client';

import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30 seconds (reduced from 60s for more responsive cache)
            refetchOnWindowFocus: true, // Refresh when user returns to tab
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <CacheInvalidator />
      {children}
    </QueryClientProvider>
  );
}

// Component to handle auth-based cache invalidation
function CacheInvalidator() {
  // Only run in browser, not during SSR
  if (typeof window === 'undefined') {
    return null;
  }

  return <CacheInvalidatorClient />;
}

function CacheInvalidatorClient() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [previousUserId, setPreviousUserId] = useState<string | undefined>();

  useEffect(() => {
    // Only run when session is loaded (not during SSR or loading)
    if (status === 'loading') return;

    const currentUserId = session?.user?.id;

    // Clear all queries when user ID changes (sign in/out or account switch)
    if (currentUserId && currentUserId !== previousUserId) {
      console.log('User changed, clearing cache:', { previousUserId, currentUserId });
      queryClient.clear();
      setPreviousUserId(currentUserId);
    } else if (!currentUserId && previousUserId) {
      // User signed out, clear cache
      console.log('User signed out, clearing cache');
      queryClient.clear();
      setPreviousUserId(undefined);
    }
  }, [session?.user?.id, status, queryClient, previousUserId]);

  return null;
}
