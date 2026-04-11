export default function DashboardLoading() {
  return (
    <div style={{ maxWidth: 1080 }} className="mx-auto space-y-8">
      {/* Greeting skeleton */}
      <div className="skeleton-line" style={{ width: "40%", height: 24 }} />
      {/* Week summary skeleton */}
      <div
        className="rounded-[var(--radius-lg)]"
        style={{
          backgroundColor: "var(--bg-elevated)",
          padding: 24,
        }}
      >
        <div className="skeleton-line" style={{ width: "60%", height: 16, marginBottom: 16 }} />
        <div className="skeleton-line" style={{ width: "100%", height: 8, borderRadius: 4 }} />
      </div>
      {/* Two-column grid */}
      <div className="grid grid-cols-1 tablet-lg:grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-[var(--radius-lg)]"
            style={{
              border: "1px solid var(--border-default)",
              backgroundColor: "var(--bg-surface)",
              padding: 24,
            }}
          >
            <div className="skeleton-line" style={{ width: "50%", height: 14, marginBottom: 16 }} />
            <div className="skeleton-line" style={{ width: "80%", height: 12 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
