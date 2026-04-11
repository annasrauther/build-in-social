"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WeekHeader } from "@/components/plan/WeekHeader";
import { DayGroup } from "@/components/plan/DayGroup";
import { QualityGate } from "@/components/plan/QualityGate";
import { VideoEditDialog } from "@/components/plan/VideoEditDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { BuildInSocialThinking } from "@/components/shared/BuildInSocialThinking";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button, KIND, SIZE } from "baseui/button";
import { StickyBar } from "@/components/ui/StickyBar";
import { useWeek } from "@/lib/context/week-context";
import { APP } from "@/content/app";
import type { PlanVideo } from "@/components/plan/VideoCard";
import { pageVariants, pageTransition } from "@/lib/motion";

function getWeekRange(): string {
  const now = new Date();
  const mon = new Date(now);
  mon.setDate(now.getDate() - now.getDay() + 1);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(mon)} \u2013 ${fmt(sun)}`;
}

function groupByDay(videos: PlanVideo[]): [string, PlanVideo[]][] {
  const order = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const map: Record<string, PlanVideo[]> = {};
  for (const v of videos) {
    if (!map[v.dayOfWeek]) map[v.dayOfWeek] = [];
    map[v.dayOfWeek].push(v);
  }
  return order.filter((d) => map[d]).map((d) => [d, map[d]]);
}

export default function CurrentPlanPage() {
  const {
    videos,
    mode,
    generationState,
    generatePlan,
    regeneratePlan,
    approveVideo,
    approveAll,
    editVideo,
    resetWeek,
  } = useWeek();

  const [editingVideo, setEditingVideo] = useState<PlanVideo | null>(null);
  const [showQualityGate, setShowQualityGate] = useState(false);
  const [showStartFreshConfirm, setShowStartFreshConfirm] = useState(false);

  const hasPlan = generationState === "ready" && videos.length > 0;
  const isGenerating = generationState === "generating";
  const approvedCount = videos.filter((v) => v.status === "approved").length;

  function handleChooseManual() {
    setShowQualityGate(true);
  }

  function handleQualityGateSubmit(answers: [string, string, string]) {
    setShowQualityGate(false);
    generatePlan("manual", answers);
  }

  function handleChooseAutopilot() {
    setShowQualityGate(false);
    generatePlan("autopilot");
  }

  function handleRegenerate() {
    regeneratePlan();
  }

  const handleSaveEdit = useCallback(
    (id: string, updates: { title: string; hook: string; script: string }) => {
      editVideo(id, updates);
    },
    [editVideo]
  );

  const grouped = groupByDay(videos);

  return (
    <>
      <motion.div
        className="space-y-6 max-w-3xl pb-20 tablet-sm:pb-0"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        transition={pageTransition}
      >
        {/* Week header — when plan exists */}
        {hasPlan && (
          <WeekHeader
            dateRange={getWeekRange()}
            totalVideos={videos.length}
            approvedVideos={approvedCount}
            onApproveAll={approveAll}
            onRegenerate={handleRegenerate}
            isRegenerating={isGenerating}
          />
        )}

        {/* No plan — mode choice */}
        {!hasPlan && !isGenerating && !showQualityGate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div>
              <p
                className="text-[var(--type-micro)] font-medium uppercase tracking-[0.07em] mb-1"
                style={{ color: "var(--text-tertiary)" }}
              >
                {APP.PLAN.weeklyPlanLabel}
              </p>
              <h2
                className="text-[var(--type-display-mobile)] tablet-sm:text-[var(--type-display-desktop)]"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  color: "var(--text-primary)",
                }}
              >
                {getWeekRange()}
              </h2>
            </div>

            <div className="space-y-3">
              {/* Manual mode */}
              <Card interactive onClick={handleChooseManual}>
                <CardContent>
                  <p
                    className="text-[var(--type-body-mobile)] tablet-sm:text-[var(--type-body-desktop)] font-medium mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {APP.PLAN.manualTitle}
                  </p>
                  <p
                    className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {APP.PLAN.manualDescription}
                  </p>
                </CardContent>
              </Card>

              {/* Autopilot */}
              <Card
                interactive
                onClick={handleChooseAutopilot}
                className="border-[var(--accent)]"
                style={{ borderColor: "var(--accent)", borderWidth: "1.5px", backgroundColor: "var(--accent-subtle)" } as React.CSSProperties}
              >
                <CardContent>
                  <div className="flex items-center gap-2 mb-1">
                    <p
                      className="text-[var(--type-body-mobile)] tablet-sm:text-[var(--type-body-desktop)] font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {APP.PLAN.autopilotTitle}
                    </p>
                    <Badge variant="approved">{APP.PLAN.autopilotBadge}</Badge>
                  </div>
                  <p
                    className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {APP.PLAN.autopilotDescription}
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Quality gate */}
        <AnimatePresence>
          {showQualityGate && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <QualityGate
                onSubmit={handleQualityGateSubmit}
                onAutopilot={handleChooseAutopilot}
                loading={false}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generating */}
        {isGenerating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <BuildInSocialThinking sequence="plan" estimatedMs={3500} />
            <div className="grid grid-cols-1 tablet-lg:grid-cols-2 gap-3 mt-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Plan ready — day groups */}
        {hasPlan && !isGenerating && (
          <div className="space-y-6">
            {grouped.map(([day, dayVideos], groupIdx) => {
              const startIndex = grouped
                .slice(0, groupIdx)
                .reduce((s, [, v]) => s + v.length, 0);
              return (
                <DayGroup
                  key={day}
                  day={day}
                  videos={dayVideos}
                  startIndex={startIndex}
                  onApprove={approveVideo}
                  onEdit={setEditingVideo}
                />
              );
            })}

            {/* Start fresh */}
            <div className="pt-4">
              <Button
                kind={KIND.tertiary}
                size={SIZE.compact}
                onClick={() => setShowStartFreshConfirm(true)}
              >
                {APP.PLAN.startFresh}
              </Button>
            </div>

            <ConfirmDialog
              open={showStartFreshConfirm}
              onOpenChange={setShowStartFreshConfirm}
              title={APP.PLAN.startFreshTitle}
              description={APP.PLAN.startFreshDescription}
              confirmLabel={APP.PLAN.startFreshConfirm}
              onConfirm={resetWeek}
              destructive
            />
          </div>
        )}
      </motion.div>

      {/* Mobile StickyBar — approve count + approve all */}
      {hasPlan && !isGenerating && (
        <StickyBar>
          <span
            className="flex-1"
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 500,
              fontSize: "var(--type-supporting-mobile)",
              color: "var(--accent)",
            }}
          >
            {APP.DASHBOARD.approved(approvedCount, videos.length)}
          </span>
          <Button size={SIZE.compact} onClick={approveAll}>
            {APP.PLAN.approveAll}
          </Button>
        </StickyBar>
      )}

      {/* Edit dialog */}
      <VideoEditDialog
        video={editingVideo}
        onClose={() => setEditingVideo(null)}
        onSave={handleSaveEdit}
      />
    </>
  );
}
