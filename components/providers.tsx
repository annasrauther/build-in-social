"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ClerkProvider } from "@clerk/nextjs";
import { useState } from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TooltipProvider } from "@/components/ui/shadcn/tooltip";
import { Toaster } from "@/components/providers/Toaster";

const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const devAuth = process.env.NEXT_PUBLIC_DEV_AUTH === "1";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  const inner = (
    <NuqsAdapter>
      <TooltipProvider delayDuration={300} skipDelayDuration={200}>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster />
          {process.env.NODE_ENV === "development" && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryClientProvider>
      </TooltipProvider>
    </NuqsAdapter>
  );

  // Wrap with ClerkProvider only when keys are configured AND dev-auth bypass
  // is off. When NEXT_PUBLIC_DEV_AUTH=1, Clerk hooks must not run.
  if (hasClerkKey && !devAuth) {
    return <ClerkProvider>{inner}</ClerkProvider>;
  }

  return inner;
}
