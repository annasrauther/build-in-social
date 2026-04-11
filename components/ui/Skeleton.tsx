import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return (
    <div
      className={clsx("skeleton-line", className)}
      {...props}
    />
  );
}
