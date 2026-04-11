"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const fadeIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.18, duration: 0.6, ease },
  }),
};

const draw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { delay: i * 0.15, duration: 0.7, ease }, opacity: { delay: i * 0.15, duration: 0.2 } },
  }),
};

export function PlatformsIllustration() {
  return (
    <motion.svg
      width="280"
      height="280"
      viewBox="0 0 280 280"
      fill="none"
      initial="hidden"
      animate="visible"
      className="w-full h-full"
    >
      {/* Desktop monitor — center */}
      <motion.g custom={0} variants={fadeIn}>
        <rect x="70" y="55" width="140" height="90" rx="6" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
        <line x1="140" y1="145" x2="140" y2="162" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
        <line x1="115" y1="162" x2="165" y2="162" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" />
        {/* Screen content */}
        <rect x="82" y="68" width="45" height="30" rx="3" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
        <line x1="82" y1="108" x2="148" y2="108" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="82" y1="118" x2="130" y2="118" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="82" y1="128" x2="140" y2="128" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" strokeLinecap="round" />
        {/* Play button in video */}
        <path d="M100 78 L100 90 L110 84 Z" fill="rgba(139,105,20,0.4)" />
      </motion.g>

      {/* Phone — left */}
      <motion.g custom={1} variants={fadeIn}>
        <rect x="22" y="100" width="50" height="85" rx="8" stroke="rgba(139,105,20,0.6)" strokeWidth="1.5" />
        <rect x="30" y="112" width="34" height="24" rx="3" stroke="rgba(139,105,20,0.3)" strokeWidth="0.8" />
        <path d="M43 120 L43 130 L51 125 Z" fill="rgba(139,105,20,0.3)" />
        <line x1="30" y1="144" x2="58" y2="144" stroke="rgba(139,105,20,0.2)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="30" y1="152" x2="50" y2="152" stroke="rgba(139,105,20,0.15)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="38" y1="177" x2="56" y2="177" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" />
        {/* Phone pulse */}
        <motion.rect
          x="22" y="100" width="50" height="85" rx="8"
          stroke="rgba(139,105,20,0.3)"
          strokeWidth="1"
          fill="none"
          animate={{ scale: [1, 1.04, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          style={{ transformOrigin: "47px 142px" }}
        />
      </motion.g>

      {/* Tablet — right */}
      <motion.g custom={2} variants={fadeIn}>
        <rect x="208" y="92" width="52" height="72" rx="6" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
        <line x1="218" y1="107" x2="248" y2="107" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="218" y1="117" x2="242" y2="117" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="218" y1="127" x2="246" y2="127" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="218" y="136" width="22" height="16" rx="2" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
      </motion.g>

      {/* Social square — bottom center */}
      <motion.g custom={3} variants={fadeIn}>
        <rect x="100" y="180" width="80" height="70" rx="6" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
        <line x1="112" y1="198" x2="168" y2="198" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="112" y1="208" x2="156" y2="208" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="112" y1="218" x2="162" y2="218" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="112" y1="228" x2="140" y2="228" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" strokeLinecap="round" />
      </motion.g>

      {/* Connection lines — dashed, animated */}
      <motion.path d="M72 145 Q88 170 100 190" stroke="rgba(139,105,20,0.3)" strokeWidth="1" strokeDasharray="4 4" fill="none" custom={4} variants={draw} />
      <motion.path d="M208 135 Q195 160 180 185" stroke="rgba(139,105,20,0.3)" strokeWidth="1" strokeDasharray="4 4" fill="none" custom={4.5} variants={draw} />
      <motion.path d="M140 145 L140 180" stroke="rgba(139,105,20,0.25)" strokeWidth="1" strokeDasharray="4 4" custom={5} variants={draw} />

      {/* Data flow dots — animated along connections */}
      {[
        { cx: 86, cy: 165, delay: 0 },
        { cx: 195, cy: 160, delay: 1 },
        { cx: 140, cy: 165, delay: 2 },
      ].map(({ cx, cy, delay }, i) => (
        <motion.circle
          key={i}
          cx={cx}
          cy={cy}
          r="3"
          fill="rgba(139,105,20,0.8)"
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay, ease: "easeInOut" }}
        />
      ))}

      {/* Connection hub dots */}
      {[[72, 145], [208, 135], [140, 145], [100, 190], [180, 185], [140, 180]].map(([cx, cy], i) => (
        <motion.circle key={i} cx={cx} cy={cy} r="2.5" fill="rgba(255,255,255,0.25)" custom={4 + i * 0.1} variants={fadeIn} />
      ))}
    </motion.svg>
  );
}
