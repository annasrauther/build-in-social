"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ease, ELEMENT_ENTER } from "@/lib/motion";
import { APP } from "@/content/app";
import { Card } from "@/components/ui/Card";
import { ListRow } from "@/components/ui/ListRow";
import { Badge } from "@/components/ui/Badge";
import { Button, KIND, SIZE } from "baseui/button";

type PlatformKey = keyof typeof APP.PLATFORMS;

interface PlatformState {
  id: PlatformKey;
  connected: boolean;
}

const PLATFORM_IDS: PlatformKey[] = ["youtube", "instagram", "linkedin", "x"];

export default function PlatformsSettingsPage() {
  const [platforms, setPlatforms] = useState<PlatformState[]>(
    PLATFORM_IDS.map((id) => ({ id, connected: false }))
  );
  const [connecting, setConnecting] = useState<string | null>(null);

  async function handleConnect(id: string) {
    setConnecting(id);
    await new Promise((r) => setTimeout(r, 1200));
    setPlatforms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, connected: true } : p))
    );
    setConnecting(null);
  }

  function handleDisconnect(id: string) {
    setPlatforms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, connected: false } : p))
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2
          className="text-[var(--type-section-mobile)] tablet-sm:text-[var(--type-section-desktop)]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 400, color: "var(--text-primary)" }}
        >
          {APP.SETTINGS_PLATFORMS.title}
        </h2>
        <p
          className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)] mt-1"
          style={{ color: "var(--text-tertiary)" }}
        >
          {APP.SETTINGS_PLATFORMS.subtitle}
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        {platforms.map((p, i) => {
          const info = APP.PLATFORMS[p.id];
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: ELEMENT_ENTER, ease: [...ease] }}
            >
              <ListRow
                noBorder={i === platforms.length - 1}
                left={
                  <span
                    className="text-[var(--type-micro)] font-medium"
                    style={{ fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--text-secondary)" }}
                  >
                    {info.short}
                  </span>
                }
                supporting={info.frequency}
                right={
                  <div className="flex items-center gap-2">
                    {p.connected && (
                      <Badge variant="success">{APP.SETTINGS_PLATFORMS.connected}</Badge>
                    )}
                    {p.connected ? (
                      <Button
                        kind={KIND.tertiary}
                        size={SIZE.compact}
                        onClick={() => handleDisconnect(p.id)}
                      >
                        {APP.SETTINGS_PLATFORMS.disconnect}
                      </Button>
                    ) : (
                      <Button
                        size={SIZE.compact}
                        isLoading={connecting === p.id}
                        onClick={() => handleConnect(p.id)}
                      >
                        {connecting === p.id
                          ? APP.SETTINGS_PLATFORMS.connecting
                          : APP.SETTINGS_PLATFORMS.connect}
                      </Button>
                    )}
                  </div>
                }
              >
                {info.label}
              </ListRow>
            </motion.div>
          );
        })}
      </Card>

      <p
        className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)]"
        style={{ color: "var(--text-tertiary)" }}
      >
        {APP.SETTINGS_PLATFORMS.oauthNotice}
      </p>
    </div>
  );
}
