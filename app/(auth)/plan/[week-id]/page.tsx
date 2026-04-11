export default function WeekPlanPage({ params }: { params: Promise<{ "week-id": string }> }): React.ReactElement {
  return (
    <div className="space-y-6">
      <h2 className="text-[18px]" style={{ color: "var(--text-primary)" }}>
        Week Plan
      </h2>
      <p className="text-[14px]" style={{ color: "var(--text-tertiary)" }}>
        Historical week view — coming in Sprint 5.
      </p>
    </div>
  );
}
