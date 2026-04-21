"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { OnboardingData, OnboardingStep } from "@/lib/types/onboarding";
import { STORAGE_KEY, TTL_MS, STEP_ROUTES } from "@/lib/constants/onboarding";

/* -------------------------------------------------------------------------- */
/*  Context shape                                                              */
/* -------------------------------------------------------------------------- */

interface OnboardingContextValue {
  data: OnboardingData;
  update: (partial: Partial<OnboardingData>) => void;
  goToStep: (step: OnboardingStep) => void;
  canProceed: boolean;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function createInitialData(): OnboardingData {
  return {
    sessionId: crypto.randomUUID(),
    currentStep: 1,
    startedAt: new Date().toISOString(),
    productInput: "",
    productDescription: "",
    productDomain: "",
    productName: "",
    productOgImage: "",
    productFaviconUrl: "",
    productMetaSource: undefined,
    niche: "",
    nicheAudiences: [],
    nicheCustomEntries: [],
    tone: "friendly-expert",
    platforms: [],
    voiceChoice: "library",
    libraryVoiceId: "alex",
    paymentComplete: false,
  };
}

function loadFromStorage(): OnboardingData {
  if (typeof window === "undefined") return createInitialData();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialData();

    const stored = JSON.parse(raw) as OnboardingData;

    // TTL check — clear if older than 48 hours
    const age = Date.now() - new Date(stored.startedAt).getTime();
    if (age > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return createInitialData();
    }

    return stored;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return createInitialData();
  }
}

function persistToStorage(data: OnboardingData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — fail silently
  }
}

function computeCanProceed(data: OnboardingData): boolean {
  switch (data.currentStep) {
    // Start — need product context
    case 1:
      return data.productInput.length > 0 && data.productDescription.length > 0;

    // Voice — voice selected
    case 2:
      return !!data.libraryVoiceId;

    // Plan preview — mode choice made; this is the final step
    case 3:
      return !!data.contentMode;

    default:
      return false;
  }
}

/* -------------------------------------------------------------------------- */
/*  Provider                                                                   */
/* -------------------------------------------------------------------------- */

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const router = useRouter();
  // Always start with empty data to avoid hydration mismatch.
  // Hydrate from localStorage in useEffect after mount.
  const [data, setData] = useState<OnboardingData>(createInitialData);

  useEffect(() => {
    const stored = loadFromStorage();
    // Only update if localStorage actually had data
    if (stored.productInput || stored.platforms.length > 0 || stored.currentStep > 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount hydration from localStorage to avoid SSR mismatch
      setData(stored);
    }
  }, []);

  const update = useCallback((partial: Partial<OnboardingData>) => {
    setData((prev) => {
      const next = { ...prev, ...partial };
      persistToStorage(next);
      return next;
    });
  }, []);

  const goToStep = useCallback(
    (step: OnboardingStep) => {
      setData((prev) => {
        const next = { ...prev, currentStep: step };
        persistToStorage(next);
        return next;
      });
      router.push(STEP_ROUTES[step]);
    },
    [router],
  );

  const canProceed = useMemo(() => computeCanProceed(data), [data]);

  const value = useMemo<OnboardingContextValue>(
    () => ({ data, update, goToStep, canProceed }),
    [data, update, goToStep, canProceed],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hook                                                                       */
/* -------------------------------------------------------------------------- */

export function useOnboarding(): OnboardingContextValue {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
