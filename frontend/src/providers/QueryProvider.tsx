import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Always consider data stale
      gcTime: 1000 * 60 * 5, // Reduced from 30 minutes to 5 minutes
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: "always", // Always refetch on mount, regardless of cache state
      retry: 2, // Reduced retry count
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Faster retry with lower max
    },
    mutations: {
      retry: 1, // Only retry once
      retryDelay: 500, // Faster retry
    },
  },
});

// Add listener to refetch queries on visibility change
if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      // When tab becomes visible, refetch all active queries
      queryClient.invalidateQueries();
    }
  });
}

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export { queryClient };
