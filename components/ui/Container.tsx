import { clsx } from "clsx";

type ContainerSize = "narrow" | "default" | "wide" | "full";

interface ContainerProps {
  size?: ContainerSize;
  className?: string;
  as?: React.ElementType;
  children: React.ReactNode;
}

/**
 * Responsive container with breakpoint-aware padding and max-widths.
 * Mobile styles are the default. Desktop overrides scale up.
 *
 * Sizes control max-width:
 * - narrow:  640px  (body copy, articles)
 * - default: 1080px (app content)
 * - wide:    1200px (tables, pricing)
 * - full:    1440px (hard outer limit)
 */

const sizeClasses: Record<ContainerSize, string> = {
  narrow: "max-w-[640px]",
  default: "max-w-[1080px]",
  wide: "max-w-[1200px]",
  full: "max-w-[1440px]",
};

export function Container({
  size = "default",
  className,
  as: Component = "div",
  children,
}: ContainerProps): React.ReactElement {
  return (
    <Component
      className={clsx(
        "w-full mx-auto",
        /* Mobile default: 16px padding */
        "px-4",
        /* Mobile large (428px+): 20px padding */
        "mobile-lg:px-5",
        /* Tablet (768px+): 32px padding */
        "tablet-sm:px-8",
        /* Desktop small (1280px+): 48px padding */
        "desktop-sm:px-12",
        /* Desktop large (1440px+): 64px padding */
        "desktop-md:px-16",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </Component>
  );
}
