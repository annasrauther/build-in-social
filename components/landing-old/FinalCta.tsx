"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LANDING } from "@/content/landing";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Final CTA — cycles through the same background colors as the hero.
 * Medium-style big serif heading, centered.
 */

const bgColors = [
  "rgb(232, 237, 243)",
  "rgb(242, 218, 230)",
  "rgb(254, 243, 225)",
  "rgb(220, 238, 225)",
];

const INTERVAL = 5000;

export function FinalCta() {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % bgColors.length);
  }, []);

  useEffect(() => {
    const id = setInterval(next, INTERVAL);
    return () => clearInterval(id);
  }, [next]);

  return (
    <motion.section
      className="lp-section"
      animate={{ backgroundColor: bgColors[index] }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      style={{
        textAlign: "center",
        paddingBottom: 0, // Sit flush with the footer
      }}
    >
      <div className="lp-container">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease }}
          style={{
            fontFamily: "var(--lp-serif)",
            fontSize: "clamp(40px, 5vw, 70px)",
            fontWeight: 400,
            lineHeight: 1.06,
            letterSpacing: "-0.05em",
            color: "rgb(0, 0, 0)",
            marginBottom: 24,
          }}
        >
          {LANDING.FINAL_CTA.headline}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease, delay: 0.05 }}
          style={{
            fontFamily: "var(--lp-sans)",
            fontSize: 20,
            lineHeight: "28px",
            color: "var(--lp-text-secondary)",
            marginBottom: 40,
            maxWidth: 520,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {LANDING.FINAL_CTA.subhead}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease, delay: 0.1 }}
          style={{ position: "relative", zIndex: 1 }}
        >
          <Link href="/onboarding/hook" className="lp-btn-primary">
            {LANDING.FINAL_CTA.ctaLabel}
          </Link>
          <p
            style={{
              fontFamily: "var(--lp-sans)",
              fontSize: 14,
              color: "var(--lp-text-secondary)",
              marginTop: 16,
              marginBottom: 64,
            }}
          >
            {LANDING.FINAL_CTA.reassurance}
          </p>
        </motion.div>
      </div>

      {/* Community Banner Illustration — Bottom Flush */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease, delay: 0.2 }}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-community-320.png"
          alt="Community of users"
          style={{
            width: "100%",
            maxWidth: 1024,
            maxHeight: 320,
            objectFit: "contain",
            objectPosition: "bottom",
            mixBlendMode: "darken",
            filter: "grayscale(100%) contrast(1.2) brightness(1.05)",
            opacity: 0.9,
          }}
        />
      </motion.div>
    </motion.section>
  );
}
