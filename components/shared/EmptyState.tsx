import { EmptyStateIllustration } from "./EmptyStateIllustration";

interface EmptyStateProps {
  icon?: React.ReactNode;
  illustrationType?: "no-videos" | "platform-disconnected" | "intelligence-locked";
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  illustrationType,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className ?? ""}`}
      style={{ maxWidth: 280, margin: "0 auto" }}
    >
      {illustrationType && (
        <div className="mb-4" style={{ width: 80, height: 80 }}>
          <EmptyStateIllustration type={illustrationType} />
        </div>
      )}
      {!illustrationType && icon && (
        <div
          className="w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center mb-4"
          style={{
            backgroundColor: "var(--bg-elevated)",
            color: "var(--text-tertiary)",
          }}
        >
          {icon}
        </div>
      )}
      <h3
        className="text-[var(--type-section-mobile)] tablet-sm:text-[var(--type-section-desktop)] font-medium mb-1"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)] leading-relaxed mb-4"
          style={{ color: "var(--text-secondary)" }}
        >
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
