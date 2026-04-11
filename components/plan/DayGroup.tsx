"use client";

import { motion } from "framer-motion";
import { VideoCard } from "./VideoCard";
import type { PlanVideo } from "./VideoCard";
import { containerVariants, dayHeaderVariants } from "@/lib/motion";

const DAY_LABELS: Record<string, string> = {
  mon: "Monday", tue: "Tuesday", wed: "Wednesday",
  thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday",
};

interface DayGroupProps {
  day: string;
  videos: PlanVideo[];
  startIndex: number;
  onApprove: (id: string) => void;
  onEdit: (video: PlanVideo) => void;
}

export function DayGroup({ day, videos, startIndex, onApprove, onEdit }: DayGroupProps) {
  return (
    <motion.div
      className="mt-8 first:mt-0"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.p
        variants={dayHeaderVariants}
        className="text-[11px] font-medium uppercase tracking-[0.08em] mb-3 sticky top-0 z-10 py-2 -mx-4 px-4 tablet-sm:static tablet-sm:py-0 tablet-sm:mx-0 tablet-sm:px-0"
        style={{
          color: "var(--text-tertiary)",
          backgroundColor: "var(--bg-page)",
        }}
      >
        {DAY_LABELS[day] ?? day}
      </motion.p>
      <div className="grid grid-cols-1 tablet-lg:grid-cols-2 gap-3">
        {videos.map((video, i) => (
          <VideoCard
            key={video.id}
            video={video}
            index={startIndex + i}
            onApprove={onApprove}
            onEdit={onEdit}
          />
        ))}
      </div>
    </motion.div>
  );
}
