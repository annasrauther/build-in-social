"use client";

import { PlanVideoCard } from "./PlanVideoCard";
import type { PlanPreviewVideo } from "@/lib/types/onboarding";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface WeekCalendarViewProps {
  videos: PlanPreviewVideo[];
}

export function WeekCalendarView({ videos }: WeekCalendarViewProps) {
  // Group videos by day
  const byDay = DAYS.reduce<Record<string, PlanPreviewVideo[]>>((acc, day) => {
    acc[day] = videos.filter((v) => v.dayOfWeek === day);
    return acc;
  }, {});

  const activeDays = DAYS.filter((d) => byDay[d].length > 0);

  return (
    <>
      {/* ── Mobile: vertical day-grouped list (< 768px) ── */}
      <div className="tablet-sm:hidden space-y-6">
        {activeDays.map((day) => (
          <div key={day}>
            <p
              className="mb-2 font-medium"
              style={{
                fontSize: "var(--type-supporting-mobile)",
                color: "var(--text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                fontFamily: "var(--font-mono)",
              }}
            >
              {day}
            </p>
            <div className="space-y-3">
              {byDay[day].map((video, i) => (
                <PlanVideoCard
                  key={`${day}-${i}`}
                  video={video}
                  delay={activeDays.indexOf(day) * 0.05 + i * 0.04}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop: 7-column grid (>= 768px) ── */}
      <div
        className="hidden tablet-sm:grid gap-3"
        style={{ gridTemplateColumns: "repeat(7, 1fr)" }}
      >
        {DAYS.map((day) => {
          const dayVideos = byDay[day];
          const hasVideos = dayVideos.length > 0;

          return (
            <div key={day}>
              {/* Day label */}
              <p
                className="mb-2 font-medium"
                style={{
                  fontSize: "var(--type-micro)",
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {day.slice(0, 3)}
              </p>

              {hasVideos ? (
                <div className="space-y-2">
                  {dayVideos.map((video, i) => (
                    <PlanVideoCard
                      key={`${day}-${i}`}
                      video={video}
                      delay={DAYS.indexOf(day) * 0.06 + i * 0.04}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className="rounded-[var(--radius-md)]"
                  style={{
                    minHeight: 80,
                    backgroundColor: "var(--bg-elevated)",
                    opacity: 0.4,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
