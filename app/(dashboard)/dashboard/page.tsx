import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/auth";
import { getVideos, getTopPerformingVideos } from "@/lib/services/db";
import { StatusCard } from "@/components/ui/StatusCard";
import { APP } from "@/content/app";
import DashboardClient from "./DashboardClient";

/**
 * Dashboard page — async RSC.
 *
 * Both data calls (profile + videos) are awaited in parallel before any HTML
 * is sent to the client, eliminating the useEffect waterfall and loading flash.
 * Auth is checked at the top; unauthenticated requests are redirected to /login.
 */
export default async function DashboardPage() {
  let profile;
  try {
    // getOrCreateUser() throws "UNAUTHORIZED" when not signed in
    profile = await getOrCreateUser();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "UNAUTHORIZED") {
      redirect("/login");
    }
    // Unexpected error — show error UI rather than crash
    return (
      <div className="px-5 pt-8 pb-14 sm:px-8 sm:pt-10 lg:px-10 lg:pt-8">
        <h1 className="font-serif text-[24px] font-bold tracking-tight mb-6">Dashboard</h1>
        <StatusCard
          variant="error"
          title="Couldn't load dashboard"
          description={APP.COMMON.errorGeneric}
          cta={APP.COMMON.retry}
          ctaHref="/dashboard"
          ctaGradient
        />
      </div>
    );
  }

  // Fetch videos and top performer in parallel.
  const [videos, topPerformerList] = await Promise.all([
    getVideos(profile.id).catch(() => []),
    getTopPerformingVideos(profile.id, 1).catch(() => []),
  ]);
  const topPerformer = topPerformerList[0] ?? null;

  return <DashboardClient profile={profile} videos={videos} topPerformer={topPerformer} />;
}
