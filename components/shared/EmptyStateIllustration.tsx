interface EmptyStateIllustrationProps {
  type: "no-videos" | "platform-disconnected" | "intelligence-locked";
}

export function EmptyStateIllustration({ type }: EmptyStateIllustrationProps) {
  if (type === "no-videos") {
    return (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <rect x="16" y="20" width="48" height="36" rx="4" stroke="var(--text-disabled)" strokeWidth="1.5" />
        <path d="M32 38L40 44L48 38" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="40" cy="60" r="2" fill="var(--text-disabled)" />
      </svg>
    );
  }

  if (type === "platform-disconnected") {
    return (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="20" stroke="var(--text-disabled)" strokeWidth="1.5" strokeDasharray="4 3" />
        <path d="M34 40H46" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M40 34V46" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // intelligence-locked
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <rect x="26" y="38" width="28" height="20" rx="3" stroke="var(--text-disabled)" strokeWidth="1.5" />
      <path d="M32 38V30a8 8 0 0116 0v8" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="40" cy="49" r="2" fill="var(--text-disabled)" />
    </svg>
  );
}
