"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease },
  }),
};

const COLUMNS = [
  { x: 30, cards: [{ y: 78, h: 38, accent: true }, { y: 122, h: 30 }, { y: 158, h: 26 }] },
  { x: 80, cards: [{ y: 78, h: 30 }, { y: 114, h: 42, accent: true }] },
  { x: 130, cards: [{ y: 78, h: 42 }, { y: 126, h: 30 }, { y: 162, h: 30, accent: true }] },
  { x: 180, cards: [{ y: 78, h: 36, accent: true }, { y: 120, h: 28 }] },
  { x: 230, cards: [{ y: 78, h: 30 }, { y: 114, h: 38 }] },
];

const COL_W = 42;
const DAYS = ["M", "T", "W", "T", "F"];

export function PlanPreviewIllustration() {
  return (
    <motion.svg
      width="280"
      height="280"
      viewBox="0 0 280 240"
      fill="none"
      initial="hidden"
      animate="visible"
      className="w-full h-full"
    >
      {/* Calendar header bar */}
      <motion.rect
        x="25" y="20" width="235" height="32" rx="6"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1"
        custom={0}
        variants={fadeIn}
      />
      {/* Calendar icon */}
      <motion.g custom={0.3} variants={fadeIn}>
        <rect x="35" y="27" width="14" height="12" rx="2" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <line x1="38" y1="25" x2="38" y2="29" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeLinecap="round" />
        <line x1="46" y1="25" x2="46" y2="29" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeLinecap="round" />
      </motion.g>
      {/* Header text lines */}
      <motion.line x1="56" y1="33" x2="105" y2="33" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" custom={0.5} variants={fadeIn} />
      <motion.line x1="56" y1="40" x2="85" y2="40" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeLinecap="round" custom={0.6} variants={fadeIn} />

      {/* Day labels */}
      {COLUMNS.map((col, i) => (
        <motion.text
          key={`day-${i}`}
          x={col.x + COL_W / 2}
          y="68"
          textAnchor="middle"
          fill="rgba(255,255,255,0.35)"
          fontSize="11"
          fontWeight="600"
          fontFamily="var(--font-mono)"
          custom={1 + i * 0.08}
          variants={fadeIn}
        >
          {DAYS[i]}
        </motion.text>
      ))}

      {/* Content cards per column — staggered column by column */}
      {COLUMNS.map((col, colIdx) =>
        col.cards.map((card, cardIdx) => {
          const isAccent = !!card.accent;
          return (
            <motion.g key={`${colIdx}-${cardIdx}`} custom={1.5 + colIdx * 0.2 + cardIdx * 0.08} variants={fadeIn}>
              <rect
                x={col.x}
                y={card.y}
                width={COL_W}
                height={card.h}
                rx="4"
                stroke={isAccent ? "rgba(139,105,20,0.6)" : "rgba(255,255,255,0.12)"}
                strokeWidth={isAccent ? "1.5" : "0.8"}
                fill={isAccent ? "rgba(139,105,20,0.1)" : "none"}
              />
              {/* Content lines */}
              <line
                x1={col.x + 6}
                y1={card.y + 10}
                x2={col.x + COL_W - 6}
                y2={card.y + 10}
                stroke={isAccent ? "rgba(139,105,20,0.35)" : "rgba(255,255,255,0.08)"}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {card.h > 28 && (
                <line
                  x1={col.x + 6}
                  y1={card.y + 19}
                  x2={col.x + COL_W - 12}
                  y2={card.y + 19}
                  stroke={isAccent ? "rgba(139,105,20,0.2)" : "rgba(255,255,255,0.05)"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              )}
            </motion.g>
          );
        })
      )}

      {/* Scanning line — ambient animation across columns */}
      <motion.line
        x1="25"
        x2="265"
        stroke="rgba(139,105,20,0.25)"
        strokeWidth="1"
        animate={{
          y1: [78, 200, 78],
          y2: [78, 200, 78],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Progress bar at bottom */}
      <motion.rect x="30" y="215" width="225" height="5" rx="2.5" fill="rgba(255,255,255,0.06)" custom={4} variants={fadeIn} />
      <motion.rect
        x="30"
        y="215"
        height="5"
        rx="2.5"
        fill="rgba(139,105,20,0.5)"
        animate={{ width: [0, 95, 95] }}
        transition={{ duration: 1.5, delay: 1, ease }}
      />

      {/* Checkmark appearing on accent cards — delayed */}
      {COLUMNS.flatMap((col, colIdx) =>
        col.cards
          .filter((c) => c.accent)
          .map((card) => (
            <motion.g
              key={`check-${colIdx}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2 + colIdx * 0.2, duration: 0.4, ease }}
            >
              <circle
                cx={col.x + COL_W - 8}
                cy={card.y + 8}
                r="5"
                fill="rgba(139,105,20,0.8)"
              />
              <path
                d={`M${col.x + COL_W - 11} ${card.y + 8} L${col.x + COL_W - 9} ${card.y + 10} L${col.x + COL_W - 5} ${card.y + 6}`}
                stroke="white"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </motion.g>
          ))
      )}
    </motion.svg>
  );
}
