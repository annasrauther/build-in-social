"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Provider as StyletronProvider } from "styletron-react";
import { BaseProvider } from "baseui";
import { ClerkProvider } from "@clerk/nextjs";
import { useState } from "react";
import { styletron } from "@/lib/styletron";
import { theme } from "@/lib/baseweb-theme";

const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

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
    <StyletronProvider value={styletron}>
      <BaseProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          {children}
          {process.env.NODE_ENV === "development" && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryClientProvider>
      </BaseProvider>
    </StyletronProvider>
  );

  // Wrap with ClerkProvider only when keys are configured
  if (hasClerkKey) {
    return <ClerkProvider>{inner}</ClerkProvider>;
  }

  return inner;
}
