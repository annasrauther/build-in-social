interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={className}
      style={{
        padding: 16,
        borderRadius: "var(--radius-lg)",
        backgroundColor: "var(--bg-elevated)",
      }}
    >
      {/* Thumbnail area */}
      <div className="skeleton-line" style={{ width: "100%", height: 120 }} />
      {/* Title line */}
      <div className="skeleton-line" style={{ width: "70%", height: 14, marginTop: 12 }} />
      {/* Subtitle line */}
      <div className="skeleton-line" style={{ width: "40%", height: 12, marginTop: 6 }} />
      {/* Action pills */}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <div className="skeleton-line" style={{ width: 60, height: 28, borderRadius: "var(--radius-sm)" }} />
        <div className="skeleton-line" style={{ width: 60, height: 28, borderRadius: "var(--radius-sm)" }} />
        <div className="skeleton-line" style={{ width: 60, height: 28, borderRadius: "var(--radius-sm)" }} />
      </div>
    </div>
  );
}
