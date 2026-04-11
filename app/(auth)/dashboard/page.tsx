"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PLATFORM_CONFIGS } from "@/lib/utils/platform-config";
import { pageVariants, pageTransition } from "@/lib/motion";
import { useWeek } from "@/lib/context/week-context";
import { useUser } from "@/lib/context/user-context";
import { APP } from "@/content/app";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Button, KIND } from "baseui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { ListRow } from "@/components/ui/ListRow";
import type { Platform } from "@/lib/types/user";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return APP.DASHBOARD.greetingMorning;
  if (hour < 17) return APP.DASHBOARD.greetingAfternoon;
  return APP.DASHBOARD.greetingEvening;
}

const PLATFORM_COLORS: Record<Platform, string> = {
  youtube: "var(--danger)",
  instagram: "var(--accent)",
  linkedin: "var(--accent-hover)",
  x: "var(--text-primary)",
};

const DAY_LABELS: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export default function DashboardPage(): React.ReactElement {
  const { user } = useUser();
  const { videos, generationState, mode } = useWeek();

  const platforms = user.platforms;
  const hasPlan = generationState === "ready" && videos.length > 0;
  const approvedCount = videos.filter((v) => v.status === "approved").length;
  const totalVideos = videos.length;
  const pct =
    totalVideos > 0 ? Math.round((approvedCount / totalVideos) * 100) : 0;

  const nextVideo =
    videos.find((v) => v.status === "draft") ??
    videos.find((v) => v.status === "approved");

  return (
    <motion.div
      className="space-y-6"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      transition={pageTransition}
    >
      {/* Greeting — display scale */}
      <div>
        <h2
          className="text-[var(--type-display-mobile)] tablet-sm:text-[var(--type-display-desktop)]"
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
          }}
        >
          {getGreeting()}
        </h2>
        <p
          className="text-[var(--type-body-mobile)] tablet-sm:text-[var(--type-body-desktop)] mt-1"
          style={{ color: "var(--text-secondary)" }}
        >
          {APP.DASHBOARD.subtitle}
        </p>
      </div>

      {/* Week summary card */}
      <Card>
        {hasPlan ? (
          <>
            <CardHeader>
              <CardTitle>
                {APP.DASHBOARD.weekSummary} &mdash; {totalVideos} videos across{" "}
                {new Set(videos.map((v) => v.platform)).size} platform
                {new Set(videos.map((v) => v.platform)).size !== 1 ? "s" : ""}
              </CardTitle>
              <Link
                href="/plan/current"
                className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)] font-medium"
                style={{ color: "var(--accent)" }}
              >
                {APP.DASHBOARD.reviewCta}
              </Link>
            </CardHeader>

            <CardContent>
              {/* Mode badge */}
              {mode && (
                <div className="mb-4">
                  <Badge variant={mode === "autopilot" ? "approved" : "default"}>
                    {mode === "autopilot"
                      ? APP.DASHBOARD.modeAutopilot
                      : APP.DASHBOARD.modeManual}
                  </Badge>
                </div>
              )}

              {/* Platform pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {Array.from(new Set(videos.map((v) => v.platform))).map((p) => {
                  const count = videos.filter((v) => v.platform === p).length;
                  return (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[var(--type-supporting-mobile)] font-medium"
                      style={{
                        backgroundColor: "var(--bg-elevated)",
                        color: "var(--text-secondary)",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: PLATFORM_COLORS[p] }}
                      />
                      {APP.PLATFORMS[p].label} {count}
                    </span>
                  );
                })}
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span
                    style={{
                      color: "var(--text-tertiary)",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 500,
                      fontSize: "var(--type-supporting-desktop)",
                    }}
                  >
                    {approvedCount > 0
                      ? APP.DASHBOARD.approved(approvedCount, totalVideos)
                      : APP.DASHBOARD.noApproved}
                  </span>
                  <span
                    style={{
                      color: "var(--text-tertiary)",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 500,
                      fontSize: "var(--type-supporting-desktop)",
                    }}
                  >
                    {pct}%
                  </span>
                </div>
                <Progress value={pct} />
              </div>
            </CardContent>
          </>
        ) : (
          <EmptyState
            title={APP.DASHBOARD.emptyTitle}
            description={APP.DASHBOARD.emptyDescription}
            action={
              <Link href="/plan/current">
                <Button>{APP.DASHBOARD.emptyCta}</Button>
              </Link>
            }
          />
        )}
      </Card>

      {/* Two column grid — cards on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 tablet-lg:grid-cols-2 gap-6">
        {/* Next scheduled */}
        <Card>
          <CardHeader>
            <CardTitle>{APP.DASHBOARD.nextScheduled}</CardTitle>
          </CardHeader>
          <CardContent>
            {hasPlan && nextVideo ? (
              <ListRow
                left={
                  <span
                    className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold"
                    style={{
                      backgroundColor: PLATFORM_COLORS[nextVideo.platform],
                      color: "var(--text-inverse)",
                    }}
                  >
                    {APP.PLATFORMS[nextVideo.platform].short}
                  </span>
                }
                supporting={`${nextVideo.durationSeconds}s \u00b7 ${nextVideo.status}`}
                noBorder
              >
                <span className="font-medium line-clamp-2">
                  {nextVideo.title}
                </span>
              </ListRow>
            ) : (
              <div>
                <p
                  className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {APP.DASHBOARD.nextScheduledEmpty}
                </p>
                <Link
                  href="/plan/current"
                  className="text-[var(--type-supporting-mobile)] font-medium mt-2 inline-block"
                  style={{ color: "var(--accent)" }}
                >
                  {APP.DASHBOARD.buildPlanCta}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top performer */}
        <Card>
          <CardHeader>
            <CardTitle>{APP.DASHBOARD.topPerformer}</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)]"
              style={{ color: "var(--text-secondary)" }}
            >
              {APP.DASHBOARD.topPerformerEmpty}
            </p>
            <p
              className="text-[var(--type-supporting-mobile)] mt-1"
              style={{ color: "var(--text-tertiary)" }}
            >
              {APP.DASHBOARD.topPerformerSub}
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
