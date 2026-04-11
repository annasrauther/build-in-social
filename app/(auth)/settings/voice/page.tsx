"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ease, ELEMENT_ENTER } from "@/lib/motion";
import { APP } from "@/content/app";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { ListRow } from "@/components/ui/ListRow";
import { Button, KIND, SIZE } from "baseui/button";

export default function VoiceSettingsPage() {
  const [activeVoice, setActiveVoice] = useState("alex");
  const [hasClone, setHasClone] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    await new Promise((r) => setTimeout(r, 500));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2
          className="text-[var(--type-section-mobile)] tablet-sm:text-[var(--type-section-desktop)]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 400, color: "var(--text-primary)" }}
        >
          {APP.SETTINGS_VOICE.title}
        </h2>
        <p
          className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)] mt-1"
          style={{ color: "var(--text-tertiary)" }}
        >
          {APP.SETTINGS_VOICE.subtitle}
        </p>
      </div>

      {/* Clone section */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: ELEMENT_ENTER, ease: [...ease] }}
      >
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{APP.SETTINGS_VOICE.cloneTitle}</CardTitle>
              <CardDescription>
                {hasClone ? APP.SETTINGS_VOICE.cloneActive : APP.SETTINGS_VOICE.cloneEmpty}
              </CardDescription>
            </div>
            {hasClone ? (
              <Button
                kind={KIND.primary}
                size={SIZE.compact}
                onClick={() => setHasClone(false)}
                overrides={{
                  BaseButton: {
                    style: ({ $theme }) => ({
                      backgroundColor: $theme.colors.negative,
                      color: "#FFFFFF",
                      ":hover": { backgroundColor: $theme.colors.negative400 },
                    }),
                  },
                }}
              >
                {APP.SETTINGS_VOICE.removeClone}
              </Button>
            ) : (
              <Button size={SIZE.compact} onClick={() => setHasClone(true)}>
                {APP.SETTINGS_VOICE.uploadSample}
              </Button>
            )}
          </CardHeader>
          {!hasClone && (
            <CardContent>
              <p
                className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)]"
                style={{ color: "var(--text-tertiary)" }}
              >
                {APP.SETTINGS_VOICE.uploadHint}
              </p>
            </CardContent>
          )}
        </Card>
      </motion.div>

      {/* Library selection */}
      <div>
        <p
          className="text-[var(--type-body-mobile)] tablet-sm:text-[var(--type-body-desktop)] font-medium mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          {APP.SETTINGS_VOICE.libraryTitle}{" "}
          {hasClone && (
            <span
              className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)]"
              style={{ color: "var(--text-tertiary)", fontWeight: 400 }}
            >
              {APP.SETTINGS_VOICE.libraryFallback}
            </span>
          )}
        </p>

        <Card className="p-0 overflow-hidden">
          {APP.VOICES.map((voice, i) => (
            <motion.div
              key={voice.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <ListRow
                interactive
                noBorder={i === APP.VOICES.length - 1}
                onClick={() => setActiveVoice(voice.id)}
                supporting={voice.description}
                left={
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium"
                    style={{
                      backgroundColor: activeVoice === voice.id ? "var(--accent)" : "var(--bg-elevated)",
                      color: activeVoice === voice.id ? "var(--text-inverse)" : "var(--text-secondary)",
                    }}
                  >
                    {voice.name[0]}
                  </div>
                }
                right={
                  <button
                    onClick={(e) => e.stopPropagation()}
                    disabled
                    title={APP.SETTINGS_VOICE.previewComingSoon}
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-disabled)", cursor: "default" }}
                    aria-label={`Preview ${voice.name} (coming soon)`}
                  >
                    <svg width="10" height="11" viewBox="0 0 10 11" fill="currentColor">
                      <path d="M2 1.5L8.5 5.5L2 9.5V1.5Z" />
                    </svg>
                  </button>
                }
                className={activeVoice === voice.id ? "bg-[var(--accent-subtle)]" : ""}
              >
                {voice.name}
              </ListRow>
            </motion.div>
          ))}
        </Card>

        <p
          className="text-[var(--type-micro)] text-center pt-2"
          style={{ color: "var(--text-disabled)" }}
        >
          {APP.SETTINGS_VOICE.previewComingSoon}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave}>
          {APP.SETTINGS_VOICE.saveCta}
        </Button>
        {saved && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)]"
            style={{ color: "var(--accent)" }}
          >
            {APP.SETTINGS_VOICE.saved}
          </motion.span>
        )}
      </div>
    </div>
  );
}
