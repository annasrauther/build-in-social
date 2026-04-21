"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Card } from "@/components/tremor/Card";
import { Button } from "@/components/tremor/Button";
import { StatusCard } from "@/components/ui/StatusCard";
import { Badge } from "@/components/tremor/Badge";
import { Divider } from "@/components/tremor/Divider";
import { ThreadPreview } from "@/components/plan/ThreadPreview";
import { InlineScriptEditor } from "@/components/plan/InlineScriptEditor";
import { CaptionStylePicker } from "@/components/plan/CaptionStylePicker";
import { splitScriptIntoThread } from "@/lib/services/thread";
import { APP } from "@/content/app";
import type { Video } from "@/lib/types/video";
import type { CaptionStyle } from "@/lib/types/caption";
import type { HeyGenAvatar } from "@/lib/services/heygen";
import type { Series, SeriesMode } from "@/lib/types/series";

/**
 * Collapse a series' 4-mode setting onto the video-page toggle, which only
 * exposes faceless vs avatar. Combo defers to the user's per-video choice
 * (the combo picker runs server-side when the render job is built), so we
 * leave the default at faceless. Stock-ai and HeyGen both land on "avatar"
 * from the UI's point of view; the render endpoint picks the right
 * RenderKind based on the selected avatar.
 */
function seriesDefaultRenderMode(mode: SeriesMode): "faceless" | "avatar" {
  if (mode === "stock-ai-avatar" || mode === "heygen-avatar") return "avatar";
  return "faceless";
}

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

  // Script state (updated optimistically by InlineScriptEditor)
  const [scriptBody, setScriptBody] = useState<string | null>(null);

  // Revision flow state
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionNote, setRevisionNote] = useState("");
  const [revisionSubmitting, setRevisionSubmitting] = useState(false);
  const [revisionError, setRevisionError] = useState<string | null>(null);
  const [revisionFlash, setRevisionFlash] = useState<string | null>(null);

  // Caption style state — Phase 1: local only, will be sent with render job in Phase 2
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>("minimal");

  // Render mode state. Seeded to "faceless"; if the video was generated as
  // part of a series, an effect below replaces this with the series' default.
  const [renderMode, setRenderMode] = useState<"faceless" | "avatar">("faceless");
  const [userOverrodeMode, setUserOverrodeMode] = useState(false);
  const [seriesDefault, setSeriesDefault] = useState<Series | null>(null);
  const [avatars, setAvatars] = useState<HeyGenAvatar[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("");
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");
  const [renderSubmitting, setRenderSubmitting] = useState(false);
  const [renderJobId, setRenderJobId] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  // If this video is attached to a series, fetch the series so we can default
  // the render mode to its setting. User can still override — we track that
  // separately so the default doesn't clobber their choice.
  useEffect(() => {
    if (!video?.seriesId) return;
    let cancelled = false;
    fetch(`/api/series/${video.seriesId}`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled || !j?.data) return;
        const s = j.data as Series;
        setSeriesDefault(s);
        if (!userOverrodeMode) {
          setRenderMode(seriesDefaultRenderMode(s.mode));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [video?.seriesId, userOverrodeMode]);

  function chooseRenderMode(next: "faceless" | "avatar") {
    setUserOverrodeMode(true);
    setRenderMode(next);
  }

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

  // Fetch avatars when avatar mode is selected
  useEffect(() => {
    if (renderMode !== "avatar" || avatars.length > 0) return;
    fetch("/api/heygen/avatars")
      .then((r) => r.json())
      .then((j) => {
        if (j.data) {
          setAvatars(j.data as HeyGenAvatar[]);
          if ((j.data as HeyGenAvatar[]).length > 0) {
            setSelectedAvatarId((j.data as HeyGenAvatar[])[0].avatar_id);
          }
        }
      })
      .catch(() => {});
  }, [renderMode, avatars.length]);

  async function submitRender() {
    if (!video) return;
    setRenderSubmitting(true);
    setRenderError(null);
    try {
      let res: Response;
      if (renderMode === "avatar") {
        // Derive the billing kind from the series config when available.
        // Stock AI avatars cost 1 credit; HeyGen (licensed or twin) costs 15.
        // Endpoint defaults to heygen-licensed if renderKind is omitted.
        const kind =
          seriesDefault?.mode === "stock-ai-avatar"
            ? "stock-ai-avatar"
            : seriesDefault?.mode === "heygen-avatar" &&
                seriesDefault.heygenAvatarSource === "twin"
              ? "heygen-twin"
              : "heygen-licensed";
        res = await fetch("/api/render/avatar", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            videoId: video.id,
            avatarId: selectedAvatarId,
            voiceId: selectedVoiceId,
            renderKind: kind,
          }),
        });
      } else {
        res = await fetch("/api/render/faceless", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ videoId: video.id }),
        });
      }
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 402) {
          setRenderError(
            j?.message ??
              "You've reached your monthly video limit. Upgrade to continue."
          );
        } else {
          setRenderError(j?.error ?? "Build In Social couldn't start the render. Try again.");
        }
        return;
      }
      if (j?.data?.jobId) setRenderJobId(j.data.jobId);
      setVideo((prev) => prev ? { ...prev, status: "rendering" } : prev);
    } catch {
      setRenderError("Build In Social couldn't start the render. Try again.");
    } finally {
      setRenderSubmitting(false);
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
          const v = (j.data as Video) ?? null;
          setVideo(v);
          if (v) setScriptBody(v.scriptJson.body);
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
                {video.platformHooks && Object.keys(video.platformHooks).length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Platform-native hooks
                    </p>
                    <ul className="mt-1.5 space-y-1.5">
                      {(["youtube", "instagram", "linkedin", "x"] as const).map((p) => {
                        const h = video.platformHooks?.[p];
                        if (!h) return null;
                        return (
                          <li key={p} className="text-xs">
                            <span className="inline-block min-w-[70px] font-medium text-gray-600 dark:text-gray-300 capitalize">
                              {p}
                            </span>
                            <span className="text-gray-700 dark:text-gray-200">{h}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                <Divider />
                {/* Script section — for X platform with thread data, show ThreadPreview; else plain text */}
                {video.platform === "x" ? (
                  <div className="mt-4">
                    <ThreadPreview
                      tweets={
                        video.thread && video.thread.length > 0
                          ? video.thread
                          : splitScriptIntoThread(
                              [video.scriptJson.hook, scriptBody ?? video.scriptJson.body, video.scriptJson.cta]
                                .filter(Boolean)
                                .join("\n\n")
                            )
                      }
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {APP.VIDEO_DETAIL.script}
                    </h2>
                    <p className="mt-2 whitespace-pre-line text-sm text-gray-900 dark:text-gray-50">
                      {scriptBody ?? video.scriptJson.body}
                    </p>
                    <p className="mt-3 text-sm font-medium text-gray-900 dark:text-gray-50">
                      {video.scriptJson.cta}
                    </p>
                  </>
                )}

                {/* Inline script editor — direct edit, not an AI revision */}
                <InlineScriptEditor
                  videoId={video.id}
                  initialScript={scriptBody ?? video.scriptJson.body}
                  onSaved={(newScript) => setScriptBody(newScript)}
                />

                {/* Caption style picker — Phase 1: local state only; sent with render job in Phase 2 */}
                <div className="mt-6 border-t border-gray-100 pt-5 dark:border-gray-800">
                  <CaptionStylePicker
                    selected={captionStyle}
                    onSelect={setCaptionStyle}
                  />
                </div>

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

              {/* Render mode section — shown when video is draft/approved and not yet rendered */}
              {(video.status === "draft" || video.status === "approved") && !video.outputUrl && (
                <Card className="p-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {APP.VIDEO_DETAIL.RENDER_MODE.sectionTitle}
                    </h2>
                    {seriesDefault && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Series default: <Badge variant="default">{seriesDefault.mode}</Badge>
                      </span>
                    )}
                  </div>

                  {/* Mode picker */}
                  <div className="flex gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => chooseRenderMode("faceless")}
                      className={`flex-1 rounded-lg border p-3 text-left transition-colors ${
                        renderMode === "faceless"
                          ? "border-brand-500 bg-brand-50 dark:bg-brand-950/20"
                          : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                      }`}
                    >
                      <span className="block text-sm font-medium text-gray-900 dark:text-gray-50">
                        {APP.VIDEO_DETAIL.RENDER_MODE.facelessLabel}
                      </span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {APP.VIDEO_DETAIL.RENDER_MODE.facelessDescription}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => chooseRenderMode("avatar")}
                      className={`flex-1 rounded-lg border p-3 text-left transition-colors ${
                        renderMode === "avatar"
                          ? "border-brand-500 bg-brand-50 dark:bg-brand-950/20"
                          : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                      }`}
                    >
                      <span className="block text-sm font-medium text-gray-900 dark:text-gray-50">
                        {APP.VIDEO_DETAIL.RENDER_MODE.avatarLabel}
                        <Badge variant="success" className="ml-2 text-xs">New</Badge>
                      </span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {APP.VIDEO_DETAIL.RENDER_MODE.avatarDescription}
                      </span>
                    </button>
                  </div>

                  {/* Avatar / voice selectors — only shown in avatar mode */}
                  {renderMode === "avatar" && (
                    <div className="space-y-3 mb-4">
                      <div>
                        <label
                          htmlFor="avatar-select"
                          className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          {APP.VIDEO_DETAIL.RENDER_MODE.selectAvatarLabel}
                        </label>
                        <select
                          id="avatar-select"
                          value={selectedAvatarId}
                          onChange={(e) => setSelectedAvatarId(e.target.value)}
                          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50"
                        >
                          {avatars.length === 0 ? (
                            <option value="">Loading avatars...</option>
                          ) : (
                            avatars.map((a) => (
                              <option key={a.avatar_id} value={a.avatar_id}>
                                {a.avatar_name} ({a.gender})
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="voice-select"
                          className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          {APP.VIDEO_DETAIL.RENDER_MODE.selectVoiceLabel}
                        </label>
                        <input
                          id="voice-select"
                          type="text"
                          value={selectedVoiceId}
                          onChange={(e) => setSelectedVoiceId(e.target.value)}
                          placeholder="Voice ID (optional)"
                          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50"
                        />
                      </div>
                    </div>
                  )}

                  {renderError && (
                    <p role="alert" className="mb-3 text-sm text-red-600 dark:text-red-400">
                      {renderError}
                    </p>
                  )}

                  <Button
                    onClick={submitRender}
                    disabled={
                      renderSubmitting ||
                      (renderMode === "avatar" && !selectedAvatarId)
                    }
                  >
                    {renderSubmitting
                      ? renderMode === "avatar"
                        ? APP.VIDEO_DETAIL.RENDER_MODE.avatarRendering
                        : APP.VIDEO_DETAIL.RENDER_MODE.renderingStatus
                      : APP.VIDEO_DETAIL.RENDER_MODE.renderCta}
                  </Button>
                </Card>
              )}

              {/* Rendering status */}
              {video.status === "rendering" && !video.outputUrl && (
                <Card className="p-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {renderJobId
                      ? APP.VIDEO_DETAIL.RENDER_MODE.renderingStatus
                      : APP.VIDEO_DETAIL.renderingHint}
                  </p>
                </Card>
              )}

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
                      ? APP.VIDEO_DETAIL.renderingHint
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
