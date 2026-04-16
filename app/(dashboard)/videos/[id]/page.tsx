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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VideoDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [video, setVideo] = useState<Video | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
        <div className="mt-6 space-y-4">
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
                  />
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
