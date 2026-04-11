import { SkeletonCard } from "@/components/shared/SkeletonCard";

export default function VideosLoading() {
  return (
    <div style={{ maxWidth: 1080 }} className="mx-auto space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="skeleton-line" style={{ width: 140, height: 20 }} />
      </div>
      {/* Filter tabs skeleton */}
      <div className="flex gap-2">
        {[80, 60, 70, 60].map((w, i) => (
          <div key={i} className="skeleton-line" style={{ width: w, height: 28, borderRadius: 14 }} />
        ))}
      </div>
      {/* Video list skeleton */}
      <div className="space-y-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-[var(--radius-lg)]"
            style={{
              backgroundColor: "var(--bg-elevated)",
              padding: 16,
            }}
          >
            <div className="skeleton-line" style={{ width: 64, height: 40, borderRadius: "var(--radius-sm)", flexShrink: 0 }} />
            <div className="flex-1">
              <div className="skeleton-line" style={{ width: "70%", height: 14, marginBottom: 6 }} />
              <div className="skeleton-line" style={{ width: "30%", height: 12 }} />
            </div>
            <div className="skeleton-line" style={{ width: 60, height: 24, borderRadius: "var(--radius-sm)", flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
