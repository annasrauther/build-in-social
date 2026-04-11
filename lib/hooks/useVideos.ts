"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Video } from "@/lib/types/video";

export function useVideos() {
  return useQuery<Video[]>({
    queryKey: ["videos"],
    queryFn: async () => {
      const res = await fetch("/api/videos");
      if (!res.ok) throw new Error("Failed to fetch videos");
      return res.json();
    },
    staleTime: 30 * 1000,
  });
}

export function useVideo(videoId: string | null) {
  return useQuery<Video>({
    queryKey: ["video", videoId],
    queryFn: async () => {
      if (!videoId) throw new Error("No videoId");
      const res = await fetch(`/api/videos/${videoId}`);
      if (!res.ok) throw new Error("Failed to fetch video");
      return res.json();
    },
    enabled: !!videoId,
    staleTime: 30 * 1000,
  });
}

export function useDeleteVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (videoId: string) => {
      const res = await fetch(`/api/videos/${videoId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete video");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}
