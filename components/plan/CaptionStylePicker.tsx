"use client";

import { motion } from "framer-motion";
import { APP } from "@/content/app";
import type { CaptionStyle } from "@/lib/types/caption";

interface CaptionStylePickerProps {
  selected: CaptionStyle;
  onSelect: (style: CaptionStyle) => void;
}

const STYLES: CaptionStyle[] = ["minimal", "bold", "gradient", "outline", "none"];

const COPY = APP.CAPTION_STYLES;

/** Returns Tailwind class strings for sample caption text per style. */
function captionTextClass(style: CaptionStyle): string {
  switch (style) {
    case "minimal":
      return "text-white text-xs font-sans font-normal";
    case "bold":
      return "text-white text-xs font-sans font-black tracking-wide uppercase";
    case "gradient":
      return "text-xs font-sans font-semibold bg-gradient-to-r from-brand-500 to-[#6A9BCC] bg-clip-text text-transparent";
    case "outline":
      return "text-white text-xs font-sans font-semibold";
    case "none":
      return "opacity-0 text-xs";
  }
}

/** Returns style attribute for outline text-shadow effect. */
function captionInlineStyle(style: CaptionStyle): React.CSSProperties {
  if (style === "outline") {
    return {
      textShadow:
        "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
    };
  }
  return {};
}

/** The background of the mini video frame mock. */
function MiniVideoFrame({
  style,
  label,
}: {
  style: CaptionStyle;
  label: string;
}) {
  return (
    <div className="relative w-full rounded-md bg-gray-900 aspect-[9/16] flex items-end justify-center pb-3 overflow-hidden">
      {/* Simulated b-roll gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900" />
      {/* Simulated content lines */}
      <div className="absolute top-4 left-3 right-3 space-y-1">
        <div className="h-1 rounded-full bg-gray-600 w-3/4" />
        <div className="h-1 rounded-full bg-gray-600 w-1/2" />
      </div>
      {/* Caption sample */}
      <span
        className={`relative z-10 text-center px-2 leading-tight ${captionTextClass(style)}`}
        style={captionInlineStyle(style)}
        aria-label={`${COPY.preview}: ${label}`}
      >
        {style === "none" ? "No captions" : "Your caption here"}
      </span>
    </div>
  );
}

export function CaptionStylePicker({ selected, onSelect }: CaptionStylePickerProps) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-3">
        {COPY.label}
      </p>
      {/* Mobile: horizontal scroll; Desktop: 5-column grid */}
      <div
        className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-5 sm:overflow-visible sm:pb-0"
        role="radiogroup"
        aria-label={COPY.label}
      >
        {STYLES.map((style) => {
          const label = COPY[style as keyof typeof COPY] as string;
          const isSelected = selected === style;

          return (
            <motion.button
              key={style}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(style)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={[
                "flex-shrink-0 w-[100px] sm:w-auto flex flex-col gap-2 rounded-lg p-2 border-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                isSelected
                  ? "border-brand-500 bg-brand-500/5 dark:bg-brand-500/10"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600",
              ].join(" ")}
            >
              <MiniVideoFrame style={style} label={label} />
              <span
                className={[
                  "text-xs text-center font-medium",
                  isSelected
                    ? "text-brand-500"
                    : "text-gray-600 dark:text-gray-400",
                ].join(" ")}
              >
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
