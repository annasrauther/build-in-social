"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { PlanVideo } from "@/components/plan/VideoCard";
import type { Platform } from "@/lib/types/user";

type GenerationState = "idle" | "generating" | "ready";
type ContentMode = "manual" | "autopilot";

interface WeekState {
  videos: PlanVideo[];
  mode: ContentMode | null;
  generationState: GenerationState;
  qualityGateAnswers: [string, string, string] | null;
}

interface WeekContextValue extends WeekState {
  generatePlan: (
    mode: ContentMode,
    qualityGateAnswers?: [string, string, string]
  ) => Promise<void>;
  regeneratePlan: () => Promise<void>;
  approveVideo: (id: string) => void;
  approveAll: () => void;
  editVideo: (
    id: string,
    updates: Partial<Pick<PlanVideo, "title" | "hook" | "script">>
  ) => void;
  resetWeek: () => void;
}

const STORAGE_KEY = "sg_week_plan";

const defaultState: WeekState = {
  videos: [],
  mode: null,
  generationState: "idle",
  qualityGateAnswers: null,
};

const WeekContext = createContext<WeekContextValue | null>(null);

function readUserData() {
  let platforms: Platform[] = ["youtube", "instagram"];
  let niche = "software development";
  let tone = "casual";

  try {
    const p = localStorage.getItem("sg_onboard_platforms");
    if (p) platforms = JSON.parse(p) as Platform[];
  } catch {}

  const n = localStorage.getItem("sg_user_niche");
  if (n) niche = n;

  const t = localStorage.getItem("sg_user_tone");
  if (t) tone = t;

  return { platforms, niche, tone };
}

export function WeekProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WeekState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as WeekState;
        setState(parsed);
      }
    } catch {}
    setHydrated(true);
  }, []);

  // Persist to localStorage on every state change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  const generatePlan = useCallback(
    async (
      mode: ContentMode,
      qualityGateAnswers?: [string, string, string]
    ) => {
      setState((prev) => ({
        ...prev,
        mode,
        qualityGateAnswers: qualityGateAnswers ?? null,
        generationState: "generating",
      }));

      const { platforms, niche, tone } = readUserData();

      try {
        const res = await fetch("/api/plan/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode,
            platforms,
            niche,
            tone,
            qualityGateAnswers,
          }),
        });

        if (!res.ok) {
          throw new Error(`Generate failed: ${res.status}`);
        }

        const data = (await res.json()) as { videos: PlanVideo[] };

        setState((prev) => ({
          ...prev,
          videos: data.videos,
          generationState: "ready",
        }));
      } catch {
        setState((prev) => ({
          ...prev,
          generationState: "idle",
        }));
      }
    },
    []
  );

  const regeneratePlan = useCallback(async () => {
    if (!state.mode) return;
    await generatePlan(state.mode, state.qualityGateAnswers ?? undefined);
  }, [state.mode, state.qualityGateAnswers, generatePlan]);

  const approveVideo = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      videos: prev.videos.map((v) =>
        v.id === id ? { ...v, status: "approved" as const } : v
      ),
    }));

    // Mock render simulation: approved → rendering → ready
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        videos: prev.videos.map((v) =>
          v.id === id && v.status === "approved"
            ? { ...v, status: "rendering" as const }
            : v
        ),
      }));
    }, 2000);

    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        videos: prev.videos.map((v) =>
          v.id === id && v.status === "rendering"
            ? { ...v, status: "ready" as const, outputUrl: "/api/mock-download" }
            : v
        ),
      }));
    }, 8000);
  }, []);

  const approveAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      videos: prev.videos.map((v) =>
        v.status === "draft" ? { ...v, status: "approved" as const } : v
      ),
    }));
  }, []);

  const editVideo = useCallback(
    (
      id: string,
      updates: Partial<Pick<PlanVideo, "title" | "hook" | "script">>
    ) => {
      setState((prev) => ({
        ...prev,
        videos: prev.videos.map((v) =>
          v.id === id ? { ...v, ...updates } : v
        ),
      }));
    },
    []
  );

  const resetWeek = useCallback(() => {
    setState(defaultState);
  }, []);

  return (
    <WeekContext.Provider
      value={{
        ...state,
        generatePlan,
        regeneratePlan,
        approveVideo,
        approveAll,
        editVideo,
        resetWeek,
      }}
    >
      {children}
    </WeekContext.Provider>
  );
}

export function useWeek(): WeekContextValue {
  const ctx = useContext(WeekContext);
  if (!ctx) {
    throw new Error("useWeek must be used within a WeekProvider");
  }
  return ctx;
}
