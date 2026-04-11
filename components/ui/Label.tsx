import { clsx } from "clsx";
import { forwardRef, type LabelHTMLAttributes } from "react";

/* ─── Label — simple HTML label, no Radix dependency ──── */

export const Label = forwardRef<
  HTMLLabelElement,
  LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={clsx(
      "text-[13px] font-medium text-[var(--text-primary)] leading-none",
      "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";
