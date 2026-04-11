"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User } from "@/lib/types/user";

// ─── Mock user for auth-less development ──────────────────────────────────────

const MOCK_USER: User = {
  id: "user_mock_01",
  clerkUserId: "clerk_mock_01",
  email: "alex@buildinsocial.com",
  displayName: "Alex Founder",
  brandName: "Build In Social",
  niche: "Indie SaaS tools for developers",
  tone: "nerdy-warm",
  platforms: ["youtube", "instagram", "linkedin", "x"],
  onboardingComplete: true,
  subscriptionTier: "creator",
  trialStartedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
};

const hasClerk = typeof window !== "undefined" && !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// ─── Context ──────────────────────────────────────────────────────────────────

interface UserContextValue {
  user: User;
  isLoading: boolean;
  updateUser: (data: Partial<User>) => void;
  refetch: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  user: MOCK_USER,
  isLoading: false,
  updateUser: () => {},
  refetch: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(MOCK_USER);
  const [isLoading, setIsLoading] = useState(hasClerk);

  // Fetch user profile from DB via API (works with Clerk auth)
  const fetchUser = useCallback(async () => {
    if (!hasClerk) return;

    try {
      setIsLoading(true);
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const json = await res.json() as { data: User };
        if (json.data) {
          setUser(json.data);
        }
      }
    } catch {
      // Clerk might not be ready yet, keep mock
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const updateUser = useCallback(async (data: Partial<User>) => {
    // Optimistic update
    setUser((prev) => ({ ...prev, ...data }));

    if (hasClerk) {
      try {
        await fetch("/api/user/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } catch {
        // Revert on failure — for now just log
        console.error("[UserProvider] Failed to persist user update");
      }
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, updateUser, refetch: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

export { MOCK_USER };
