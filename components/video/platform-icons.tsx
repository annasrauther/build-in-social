import * as React from "react";
import type { Platform } from "@/lib/types/user";

/**
 * Platform icons — inline SVG.
 *
 * lucide-react at the pinned version (^1.7.0) doesn't ship brand icons
 * (Instagram/LinkedIn/YouTube/X), so we carry them here. Shape + stroke
 * match Lucide's conventions (16px default, stroke 1.5 where strokes
 * apply). All use `currentColor`; callers tint via `text-*` utilities.
 */

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
};

function baseProps({ size = 16, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 16 16",
    fill: "currentColor",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
    ...rest,
  };
}

export function YouTubeIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M15.6 4.4a1.97 1.97 0 0 0-1.39-1.39C12.98 2.67 8 2.67 8 2.67s-4.98 0-6.21.34A1.97 1.97 0 0 0 .4 4.4C.07 5.64.07 8 .07 8s0 2.36.33 3.6c.18.69.71 1.22 1.39 1.4 1.23.33 6.21.33 6.21.33s4.98 0 6.21-.33a1.97 1.97 0 0 0 1.39-1.4c.33-1.24.33-3.6.33-3.6s0-2.36-.33-3.6ZM6.4 10.37V5.63L10.53 8 6.4 10.37Z" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)} fill="none">
      <rect
        x="1.75"
        y="1.75"
        width="12.5"
        height="12.5"
        rx="3.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="8" cy="8" r="2.75" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="11.5" cy="4.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

export function LinkedInIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M13.5 1.5h-11A1 1 0 0 0 1.5 2.5v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-11a1 1 0 0 0-1-1ZM5 12.5H3V6.25h2V12.5ZM4 5.33a1.17 1.17 0 1 1 0-2.33 1.17 1.17 0 0 1 0 2.33ZM12.5 12.5h-2V9.17c0-.8-.29-1.33-1-1.33-.55 0-.88.37-1.02.73-.05.13-.06.31-.06.49V12.5h-2s.03-5.67 0-6.25H8.4v.88c.3-.47.83-1.13 2.02-1.13 1.47 0 2.58.96 2.58 3.03V12.5Z" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M9.17 7.1 13.77 2H12.6L8.64 6.4 5.49 2H2l4.83 6.75L2 14h1.17l4.2-4.66L10.7 14H14L9.17 7.1Zm-1.47 1.64-.49-.68L3.59 2.88h1.8l3.13 4.38.49.68 4.07 5.69h-1.8L7.7 8.74Z" />
    </svg>
  );
}

export const PLATFORM_ICON: Record<Platform, React.FC<IconProps>> = {
  youtube: YouTubeIcon,
  instagram: InstagramIcon,
  linkedin: LinkedInIcon,
  x: XIcon,
};

export const PLATFORM_LABEL: Record<Platform, string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  x: "X",
};
