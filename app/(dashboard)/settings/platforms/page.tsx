"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/tremor/Button";
import { StatusCard } from "@/components/ui/StatusCard";
import { RiAddLine, RiLoader4Line } from "@remixicon/react";
import { APP } from "@/content/app";
import type { Platform } from "@/lib/types/user";

function YouTubeSVG() {
  return (
    <svg width="26" viewBox="0 0 90 63" fill="none" aria-label="YouTube">
      <path d="M88.1 9.9C87.1 6.2 84.2 3.3 80.5 2.3 73.5.3 45 .3 45 .3S16.5.3 9.5 2.3C5.8 3.3 2.9 6.2 1.9 9.9 0 16.9 0 31.5 0 31.5s0 14.6 1.9 21.6C2.9 56.8 5.8 59.7 9.5 60.7 16.5 62.7 45 62.7 45 62.7s28.5 0 35.5-2C84.2 59.7 87.1 56.8 88.1 53.1 90 46.1 90 31.5 90 31.5s0-14.6-1.9-21.6z" fill="#FF0000" />
      <path d="M36 44.5L59.5 31.5 36 18.5v26z" fill="white" />
    </svg>
  );
}

function InstagramSVG() {
  return (
    <svg width="28" viewBox="0 0 56 56" fill="none" aria-label="Instagram">
      <defs>
        <radialGradient id="ig-settings-rg" cx="30%" cy="107%" r="130%">
          <stop offset="0%" stopColor="#ffd600" />
          <stop offset="50%" stopColor="#ff0069" />
          <stop offset="100%" stopColor="#d300c5" />
        </radialGradient>
      </defs>
      <rect width="56" height="56" rx="13" fill="url(#ig-settings-rg)" />
      <circle cx="28" cy="28" r="9.5" stroke="white" strokeWidth="3.5" fill="none" />
      <circle cx="40.5" cy="15.5" r="2.5" fill="white" />
    </svg>
  );
}

function LinkedInSVG() {
  return (
    <svg width="28" viewBox="0 0 72 72" fill="none" aria-label="LinkedIn">
      <rect width="72" height="72" rx="8" fill="#0A66C2" />
      <path d="M14 28h10v33H14V28zm5-4.5a5.8 5.8 0 110-11.6 5.8 5.8 0 010 11.6zM30 28h9.7v4.5h.1c1.4-2.5 4.7-5.1 9.6-5.1 10.3 0 12.2 6.8 12.2 15.6v18h-10V45c0-3.8-.1-8.7-5.3-8.7-5.3 0-6.1 4.1-6.1 8.4v16.3H30V28z" fill="white" />
    </svg>
  );
}

function XSVG() {
  return (
    <svg width="22" viewBox="0 0 300 300" fill="none" aria-label="X (Twitter)">
      <path d="M178.57 127.15L290.27 0H263.81L166.78 110.38 89.34 0H0l117.13 166.93L0 300.25h26.46l102.4-116.59 81.8 116.59H300L178.57 127.15zM35.02 19.54h40.51l189.94 262.13h-40.51L35.02 19.54z" fill="currentColor" />
    </svg>
  );
}

interface PlatformDef {
  id: Platform;
  name: string;
  svg: React.ReactNode;
  description: string;
  iconBg: string;
  iconColor: string;
}

const PLATFORMS: PlatformDef[] = [
  {
    id: "youtube",
    name: "YouTube Shorts",
    svg: <YouTubeSVG />,
    description: "Connect your YouTube channel to publish Shorts.",
    iconBg: "rgba(255,0,0,0.06)",
    iconColor: "inherit",
  },
  {
    id: "instagram",
    name: "Instagram Reels",
    svg: <InstagramSVG />,
    description: "Connect your Instagram account to publish Reels.",
    iconBg: "transparent",
    iconColor: "inherit",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    svg: <LinkedInSVG />,
    description: "Connect your LinkedIn profile to publish posts.",
    iconBg: "transparent",
    iconColor: "inherit",
  },
  {
    id: "x",
    name: "X (Twitter)",
    svg: <XSVG />,
    description: "Connect your X account to publish posts.",
    iconBg: "var(--bg-elevated)",
    iconColor: "var(--text-primary)",
  },
];

export default function PlatformsSettings() {
  const [connecting, setConnecting] = useState<Platform | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showComingSoon, setShowComingSoon] = useState<Record<string, boolean>>({});

  async function handleConnect(platform: Platform) {
    setConnecting(platform);
    setError(null);
    try {
      const res = await fetch("/api/settings/platform-connect", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ platform }),
      });
      const json = await res.json();
      if (res.status === 501) {
        // Honest "coming soon" state — per-platform, not a silent failure
        setShowComingSoon((prev) => ({ ...prev, [platform]: true }));
      } else if (!res.ok) {
        setError(json.error ?? APP.COMMON.errorGeneric);
      }
    } catch {
      setError(APP.COMMON.errorGeneric);
    } finally {
      setConnecting(null);
    }
  }

  return (
    <section aria-labelledby="platform-connections">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h3
            id="platform-connections"
            className="scroll-mt-10 font-semibold"
            style={{ color: "var(--text-primary)", fontSize: "var(--type-section-desktop)" }}
          >
            {APP.SETTINGS_PLATFORMS.title}
          </h3>
          <p className="mt-1" style={{ fontSize: "var(--type-supporting-desktop)", color: "var(--text-tertiary)" }}>
            {APP.SETTINGS_PLATFORMS.subtitle}
          </p>
        </div>
      </div>

      {error && (
        <StatusCard
          variant="error"
          title="Connection failed"
          description={error}
          cta="Dismiss"
          onCta={() => setError(null)}
          className="mb-5"
        />
      )}

      <div className="space-y-3">
        {PLATFORMS.map((p, i) => {
          const isConnecting = connecting === p.id;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -1, transition: { duration: 0.15 } }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                padding: "16px 20px",
                borderRadius: "var(--radius-lg)",
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-default)",
                boxShadow: "var(--shadow-sm)",
                transition: "box-shadow 150ms ease",
              }}
            >
              {/* Left: icon + info */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "var(--radius-md)",
                    backgroundColor: p.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: p.iconColor,
                  }}
                >
                  {p.svg}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p
                    className="font-medium truncate"
                    style={{ fontSize: "var(--type-body-desktop)", color: "var(--text-primary)" }}
                  >
                    {p.name}
                  </p>
                  <p
                    className="truncate"
                    style={{ fontSize: "var(--type-supporting-desktop)", color: "var(--text-tertiary)", marginTop: 1 }}
                  >
                    {p.description}
                  </p>
                </div>
              </div>

              {/* Right: status + button OR coming-soon state */}
              {showComingSoon[p.id] ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 8,
                    flexShrink: 0,
                    minWidth: 0,
                    maxWidth: 360,
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--type-micro)",
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: 99,
                      backgroundColor: "rgba(217,119,87,0.10)",
                      color: "var(--accent)",
                      border: "1px solid rgba(217,119,87,0.25)",
                    }}
                  >
                    OAuth connection — setting up
                  </span>
                  <p
                    style={{
                      fontSize: "var(--type-supporting-desktop)",
                      color: "var(--text-tertiary)",
                      textAlign: "right",
                      margin: 0,
                    }}
                  >
                    We&rsquo;ll email you when your platform is ready.
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        // Stub waitlist — uses same 501 API deliberately; user gets honest status
                        window.open("/waitlist?platform=" + p.id, "_self");
                      }}
                    >
                      Join the waitlist
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        window.open("/videos", "_self");
                      }}
                    >
                      Learn about manual publishing
                    </Button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: "var(--type-micro)",
                      fontWeight: 500,
                      padding: "3px 8px",
                      borderRadius: 99,
                      backgroundColor: "var(--bg-elevated)",
                      color: "var(--text-tertiary)",
                      border: "1px solid var(--border-default)",
                    }}
                  >
                    Not connected
                  </span>
                  <motion.div
                    whileTap={{ scale: 0.96 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <Button
                      className="gap-1.5"
                      disabled={isConnecting}
                      onClick={() => handleConnect(p.id)}
                    >
                      {isConnecting ? (
                        <>
                          <RiLoader4Line className="size-4 shrink-0 animate-spin" />
                          {APP.SETTINGS_PLATFORMS.connecting}
                        </>
                      ) : (
                        <>
                          <RiAddLine className="-ml-0.5 size-4 shrink-0" />
                          {APP.SETTINGS_PLATFORMS.connect}
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
