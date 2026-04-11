"use client";

import { useQuery } from "@tanstack/react-query";

interface RenderStatusResponse {
  status: "queued" | "rendering" | "completed" | "failed";
  progress: number;
  message: string;
  outputUrl?: string;
}

export function useRenderStatus(jobId: string | null) {
  return useQuery<RenderStatusResponse>({
    queryKey: ["render-status", jobId],
    queryFn: async () => {
      if (!jobId) throw new Error("No jobId");
      const res = await fetch(`/api/render-jobs/${jobId}`);
      if (!res.ok) throw new Error("Failed to fetch render status");
      return res.json();
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 5000;
      if (data.status === "completed" || data.status === "failed") return false;
      return 5000;
    },
    staleTime: 0,
  });
}
