"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const draw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { delay: i * 0.12, duration: 0.8, ease }, opacity: { delay: i * 0.12, duration: 0.2 } },
  }),
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease },
  }),
};

export function VoiceIllustration() {
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
      {/* Microphone body */}
      <motion.rect
        x="122" y="65" width="36" height="70" rx="18"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="2"
        custom={0}
        variants={draw}
      />
      {/* Mic grille */}
      {[78, 86, 94, 102, 110].map((y, i) => (
        <motion.line
          key={y}
          x1="130" y1={y} x2="150" y2={y}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.8"
          custom={0.5 + i * 0.08}
          variants={draw}
        />
      ))}
      {/* Mic cradle */}
      <motion.path
        d="M110 115 Q110 158 140 158 Q170 158 170 115"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.5"
        strokeLinecap="round"
        custom={1.5}
        variants={draw}
      />
      {/* Mic stand */}
      <motion.line x1="140" y1="158" x2="140" y2="195" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" custom={2} variants={draw} />
      {/* Mic base */}
      <motion.line x1="118" y1="195" x2="162" y2="195" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" custom={2.5} variants={draw} />

      {/* Sound wave arcs — pulsing outward */}
      {[
        { d: "M100 85 Q86 107 100 130", delay: 0 },
        { d: "M84 70 Q62 107 84 145", delay: 0.3 },
        { d: "M68 55 Q38 107 68 160", delay: 0.6 },
      ].map(({ d, delay }, i) => (
        <motion.path
          key={`l-${i}`}
          d={d}
          stroke={i === 0 ? "rgba(139,105,20,0.7)" : i === 1 ? "rgba(139,105,20,0.4)" : "rgba(139,105,20,0.2)"}
          strokeWidth={i === 0 ? "2" : "1.5"}
          strokeLinecap="round"
          fill="none"
          animate={{
            opacity: [0.2, i === 0 ? 0.8 : 0.5, 0.2],
            scale: [0.97, 1.02, 0.97],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay }}
          style={{ transformOrigin: "100px 107px" }}
        />
      ))}
      {[
        { d: "M180 85 Q194 107 180 130", delay: 0 },
        { d: "M196 70 Q218 107 196 145", delay: 0.3 },
        { d: "M212 55 Q242 107 212 160", delay: 0.6 },
      ].map(({ d, delay }, i) => (
        <motion.path
          key={`r-${i}`}
          d={d}
          stroke={i === 0 ? "rgba(139,105,20,0.7)" : i === 1 ? "rgba(139,105,20,0.4)" : "rgba(139,105,20,0.2)"}
          strokeWidth={i === 0 ? "2" : "1.5"}
          strokeLinecap="round"
          fill="none"
          animate={{
            opacity: [0.2, i === 0 ? 0.8 : 0.5, 0.2],
            scale: [0.97, 1.02, 0.97],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay }}
          style={{ transformOrigin: "180px 107px" }}
        />
      ))}

      {/* Equalizer bars — animated heights */}
      {[
        { x: 75, baseH: 16, maxH: 28, delay: 0 },
        { x: 90, baseH: 24, maxH: 40, delay: 0.2 },
        { x: 105, baseH: 12, maxH: 22, delay: 0.4 },
        { x: 155, baseH: 20, maxH: 34, delay: 0.1 },
        { x: 170, baseH: 30, maxH: 44, delay: 0.3 },
        { x: 185, baseH: 14, maxH: 24, delay: 0.5 },
        { x: 200, baseH: 18, maxH: 30, delay: 0.15 },
      ].map(({ x, baseH, maxH, delay }, i) => (
        <motion.rect
          key={x}
          x={x}
          width="10"
          rx="2"
          fill={i === 1 || i === 4 ? "rgba(139,105,20,0.5)" : "rgba(255,255,255,0.15)"}
          custom={i}
          variants={fadeUp}
          animate={{
            y: [240 - baseH, 240 - maxH, 240 - baseH],
            height: [baseH, maxH, baseH],
          }}
          transition={{ duration: 1.5 + i * 0.2, repeat: Infinity, ease: "easeInOut", delay }}
        />
      ))}
    </motion.svg>
  );
}
