"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Card } from "@/components/tremor/Card";
import { Button } from "@/components/tremor/Button";
import { StatusCard } from "@/components/ui/StatusCard";
import { Badge } from "@/components/tremor/Badge";
import { Divider } from "@/components/tremor/Divider";
import { APP } from "@/content/app";
import type { Video } from "@/lib/types/video";

const MAX_REVISIONS_PER_VIDEO = 3;
const NOTE_MAX = 500;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VideoDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [video, setVideo] = useState<Video | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Revision flow state
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionNote, setRevisionNote] = useState("");
  const [revisionSubmitting, setRevisionSubmitting] = useState(false);
  const [revisionError, setRevisionError] = useState<string | null>(null);
  const [revisionFlash, setRevisionFlash] = useState<string | null>(null);

  const revisionCount = video?.revisionCount ?? 0;
  const revisionsRemaining = Math.max(0, MAX_REVISIONS_PER_VIDEO - revisionCount);
  const revisionLimitReached = revisionsRemaining === 0;
  const noteOver = revisionNote.length > NOTE_MAX;

  async function submitRevision() {
    if (!video || noteOver || revisionNote.trim().length === 0) return;
    setRevisionSubmitting(true);
    setRevisionError(null);
    try {
      const res = await fetch("/api/script/revise", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ videoId: video.id, note: revisionNote.trim() }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 429) {
          setRevisionError(APP.VIDEO_DETAIL.revisionDailyCap);
        } else if (res.status === 400) {
          setRevisionError(
            j?.error === "Revision limit reached on this video."
              ? APP.VIDEO_DETAIL.revisionLimitReached
              : (j?.error as string) ?? APP.VIDEO_DETAIL.revisionError
          );
        } else {
          setRevisionError(APP.VIDEO_DETAIL.revisionError);
        }
        return;
      }
      const nextVideo = (j?.data?.video as Video) ?? null;
      if (nextVideo) setVideo(nextVideo);
      setRevisionOpen(false);
      setRevisionNote("");
      setRevisionFlash(APP.VIDEO_DETAIL.revisionSuccess);
      window.setTimeout(() => setRevisionFlash(null), 4000);
    } catch {
      setRevisionError(APP.VIDEO_DETAIL.revisionError);
    } finally {
      setRevisionSubmitting(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/videos/${id}`)
      .then(async (r) => {
        const j = await r.json();
        if (cancelled) return;
        if (!r.ok || j.error) {
          setError(j.error ?? APP.VIDEO_DETAIL.notFound);
          setVideo(null);
        } else {
          setVideo((j.data as Video) ?? null);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError(APP.COMMON.errorGeneric);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7">
      <Link
        href="/videos"
        className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
      >
        {APP.VIDEO_DETAIL.backToLibrary}
      </Link>

      {loading ? (
        <div className="mt-6 space-y-4" aria-live="polite" aria-busy="true">
          <span className="sr-only">{APP.A11Y.loading}</span>
          <div className="skeleton-line" style={{ height: 32, width: "60%", borderRadius: "var(--radius-sm)" }} />
          <div className="skeleton-line" style={{ height: 256, borderRadius: "var(--radius-lg)" }} />
        </div>
      ) : error ? (
        <StatusCard
          className="mt-6"
          variant="error"
          title="Couldn't load video"
          description={error}
          cta={APP.COMMON.retry}
          onCta={() => window.location.reload()}
          secondaryCta="Back to library"
          secondaryCtaHref="/videos"
        />
      ) : !video ? (
        <StatusCard
          className="mt-6"
          variant="notFound"
          title="Video not found"
          description={APP.VIDEO_DETAIL.notFound}
          secondaryCta="Back to library"
          secondaryCtaHref="/videos"
        />
      ) : (
        <>
          <header className="mt-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">{video.platform}</Badge>
              <Badge
                variant={
                  video.status === "ready" || video.status === "posted"
                    ? "success"
                    : video.status === "failed"
                      ? "error"
                      : "default"
                }
              >
                {video.status}
              </Badge>
              <span className="text-xs text-gray-400">
                {video.durationSeconds}s · {video.dayOfWeek?.toUpperCase()}
              </span>
            </div>
            <h1 className="text-xl font-medium text-gray-900 dark:text-gray-50">
              {video.title}
            </h1>
          </header>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-6">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {APP.VIDEO_DETAIL.openingHook}
                </h2>
                <p className="mt-2 text-base text-gray-900 dark:text-gray-50">
                  {video.scriptJson.hook}
                </p>
                <Divider />
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {APP.VIDEO_DETAIL.script}
                </h2>
                <p className="mt-2 whitespace-pre-line text-sm text-gray-900 dark:text-gray-50">
                  {video.scriptJson.body}
                </p>
                <p className="mt-3 text-sm font-medium text-gray-900 dark:text-gray-50">
                  {video.scriptJson.cta}
                </p>

                {/* Revision flow — Haiku-backed rewrite, capped 3/video. */}
                <div className="mt-6 border-t border-gray-100 pt-4 dark:border-gray-800">
                  {revisionFlash && (
                    <p
                      role="status"
                      className="mb-3 text-sm text-emerald-600 dark:text-emerald-400"
                    >
                      {revisionFlash}
                    </p>
                  )}

                  {!revisionOpen ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setRevisionError(null);
                          setRevisionOpen(true);
                        }}
                        disabled={revisionLimitReached}
                        title={
                          revisionLimitReached
                            ? APP.VIDEO_DETAIL.revisionLimitReached
                            : undefined
                        }
                        aria-disabled={revisionLimitReached}
                      >
                        {APP.VIDEO_DETAIL.revisionCta}
                      </Button>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {revisionLimitReached
                          ? APP.VIDEO_DETAIL.revisionLimitReached
                          : APP.VIDEO_DETAIL.revisionRemaining(revisionsRemaining)}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label
                        htmlFor="revision-note"
                        className="block text-sm font-medium text-gray-900 dark:text-gray-50"
                      >
                        {APP.VIDEO_DETAIL.revisionCta}
                      </label>
                      <textarea
                        id="revision-note"
                        value={revisionNote}
                        onChange={(e) => setRevisionNote(e.target.value)}
                        placeholder={APP.VIDEO_DETAIL.revisionPlaceholder}
                        disabled={revisionSubmitting}
                        aria-invalid={noteOver}
                        maxLength={NOTE_MAX + 50}
                        rows={4}
                        className="w-full rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-60 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50"
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={
                            noteOver
                              ? "text-red-600 dark:text-red-400"
                              : "text-gray-500 dark:text-gray-400"
                          }
                        >
                          {APP.VIDEO_DETAIL.revisionCharsRemaining(
                            NOTE_MAX - revisionNote.length
                          )}
                        </span>
                        {revisionError && (
                          <span
                            role="alert"
                            className="text-red-600 dark:text-red-400"
                          >
                            {revisionError}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={submitRevision}
                          disabled={
                            revisionSubmitting ||
                            noteOver ||
                            revisionNote.trim().length === 0
                          }
                        >
                          {revisionSubmitting
                            ? APP.VIDEO_DETAIL.revisionRewriting
                            : APP.VIDEO_DETAIL.revisionSendCta}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setRevisionOpen(false);
                            setRevisionNote("");
                            setRevisionError(null);
                          }}
                          disabled={revisionSubmitting}
                        >
                          {APP.VIDEO_DETAIL.revisionCancelCta}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {APP.VIDEO_DETAIL.playVideo}
                </h2>
                {video.outputUrl ? (
                  <video
                    controls
                    className="mt-3 w-full rounded-lg bg-black"
                    src={video.outputUrl}
                  >
                    {/* A7: WebVTT caption track for screen readers and caption-on viewers */}
                    {video.captionUrl && (
                      <track
                        kind="captions"
                        src={video.captionUrl}
                        srcLang="en"
                        label="English"
                        default
                      />
                    )}
                  </video>
                ) : (
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    {video.status === "rendering"
                      ? "Build In Social is rendering your video..."
                      : APP.VIDEO_DETAIL.notRendered}
                  </p>
                )}
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="p-6">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {APP.VIDEO_DETAIL.seoArticle}
                </h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {APP.VIDEO_DETAIL.seoArticlePending}
                </p>
              </Card>

              {video.outputUrl && (
                <Button asChild variant="secondary" className="w-full">
                  <a href={video.outputUrl} download>
                    {APP.VIDEO_DETAIL.download}
                  </a>
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
