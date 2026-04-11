"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const draw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { delay: i * 0.1, duration: 0.9, ease }, opacity: { delay: i * 0.1, duration: 0.2 } },
  }),
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.5 + i * 0.08, duration: 0.6, ease },
  }),
};

export function ContextIllustration() {
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
      {/* Podium — isometric 3D */}
      <motion.path
        d="M90 210 L190 210 L200 228 L80 228 Z"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        custom={0}
        variants={draw}
      />
      <motion.path
        d="M95 192 L185 192 L190 210 L90 210 Z"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        custom={0.5}
        variants={draw}
      />
      <motion.path
        d="M100 175 L180 175 L185 192 L95 192 Z"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        custom={1}
        variants={draw}
      />
      {/* Podium detail lines */}
      <motion.line x1="108" y1="182" x2="172" y2="182" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" custom={1.2} variants={draw} />

      {/* Figure — torso */}
      <motion.path
        d="M120 175 L125 148 L155 148 L160 175"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        custom={1.5}
        variants={draw}
      />
      {/* Figure — head */}
      <motion.circle
        cx="140"
        cy="132"
        r="14"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.5"
        custom={2}
        variants={draw}
      />

      {/* Spotlight cone — accent gradient */}
      {[-40, -25, -10, 5, 20, 35].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const len = 70 + i * 3;
        const x2 = 140 + Math.sin(rad) * len;
        const y2 = 110 - Math.cos(rad) * (len * 0.65);
        return (
          <motion.line
            key={angle}
            x1="140"
            y1="115"
            x2={x2}
            y2={y2}
            stroke="rgba(139,105,20,0.5)"
            strokeWidth="1"
            strokeLinecap="round"
            custom={2.5 + i * 0.08}
            variants={draw}
          />
        );
      })}

      {/* Orbiting particles — ambient loop */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.circle
          key={`particle-${i}`}
          r="2"
          fill="rgba(139,105,20,0.6)"
          custom={i}
          variants={fadeUp}
          animate={{
            cx: [60 + i * 40, 65 + i * 38, 60 + i * 40],
            cy: [70 + i * 15, 62 + i * 15, 70 + i * 15],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.4,
          }}
        />
      ))}

      {/* Floating content cards */}
      <motion.g custom={0} variants={fadeUp}>
        <rect x="40" y="80" width="42" height="28" rx="4" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <line x1="48" y1="90" x2="74" y2="90" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="48" y1="97" x2="66" y2="97" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeLinecap="round" />
      </motion.g>

      <motion.g custom={2} variants={fadeUp}>
        <rect x="198" y="72" width="42" height="28" rx="4" stroke="rgba(139,105,20,0.5)" strokeWidth="1.2" />
        <line x1="206" y1="82" x2="232" y2="82" stroke="rgba(139,105,20,0.3)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="206" y1="89" x2="224" y2="89" stroke="rgba(139,105,20,0.2)" strokeWidth="1.5" strokeLinecap="round" />
      </motion.g>

      <motion.g custom={4} variants={fadeUp}>
        <rect x="48" y="125" width="36" height="24" rx="4" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <line x1="54" y1="134" x2="78" y2="134" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeLinecap="round" />
      </motion.g>

      {/* Pulsing accent dot at podium center */}
      <motion.circle
        cx="140"
        cy="200"
        r="3"
        fill="rgba(139,105,20,0.8)"
        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}
