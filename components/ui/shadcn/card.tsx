import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Card — hairline border, no shadow. Interior radius should be
 * parent_radius − padding (e.g. card `rounded-[8px]` + `p-4` → inner
 * element `rounded-[4px]`).
 */
export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function Card({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        "bg-surface text-text",
        "border border-[color:var(--border)]",
        "rounded-[var(--radius-card)]",
        className
      )}
      {...props}
    />
  );
});

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function CardHeader({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn("p-4 pb-2 flex flex-col gap-0.5", className)}
      {...props}
    />
  );
});

export const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function CardTitle({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        "text-[14px] font-medium leading-tight text-text",
        className
      )}
      {...props}
    />
  );
});

export const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function CardDescription({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn("text-[13px] leading-snug text-text-secondary", className)}
      {...props}
    />
  );
});

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function CardContent({ className, ...props }, ref) {
  return <div ref={ref} className={cn("p-4 pt-2", className)} {...props} />;
});

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function CardFooter({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        "p-4 pt-2 flex items-center gap-2 border-t border-[color:var(--divider)]",
        className
      )}
      {...props}
    />
  );
});
