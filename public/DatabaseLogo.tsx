import * as React from "react"

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export const DatabaseLogo = ({ className, ...props }: LogoProps) => (
  <div
    className={`inline-flex items-center gap-2 ${className || ""}`}
    {...props}
  >
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-5 shrink-0"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
    <span className="whitespace-nowrap text-base font-bold leading-none tracking-tight">Build In Social</span>
  </div>
)
