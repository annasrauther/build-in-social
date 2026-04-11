"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ease, ELEMENT_ENTER } from "@/lib/motion";
import { useUser } from "@/lib/context/user-context";
import type { ContentTone } from "@/lib/types/user";
import { APP } from "@/content/app";
import { Card, CardContent } from "@/components/ui/Card";
import { Input, SIZE } from "baseui/input";
import { Textarea, SIZE as TA_SIZE } from "baseui/textarea";
import { FormControl } from "baseui/form-control";
import { Button, KIND } from "baseui/button";
import { ListRow } from "@/components/ui/ListRow";

/** Map APP.TONES ids to ContentTone values */
const TONE_MAP: Record<string, ContentTone> = {
  technical: "professional",
  conversational: "casual",
  transparent: "nerdy-warm",
};

export default function ProfileSettingsPage() {
  const { user, updateUser } = useUser();

  const [niche, setNiche] = useState(user.niche ?? "");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState<ContentTone>(user.tone as ContentTone);
  const [voiceNotes, setVoiceNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const a = localStorage.getItem("sg_user_audience");
      if (a) setAudience(a);
      const v = localStorage.getItem("sg_user_voice_notes");
      if (v) setVoiceNotes(v);
      const n = localStorage.getItem("sg_user_niche");
      if (n) setNiche(n);
      const t = localStorage.getItem("sg_user_tone");
      if (t) setTone(t as ContentTone);
    } catch {}
  }, []);

  async function handleSave() {
    setSaving(true);

    // Persist to UserProvider context
    updateUser({ niche, tone });

    // Persist to localStorage for WeekProvider to read
    try {
      localStorage.setItem("sg_user_niche", niche);
      localStorage.setItem("sg_user_tone", tone);
      localStorage.setItem("sg_user_audience", audience);
      localStorage.setItem("sg_user_voice_notes", voiceNotes);
    } catch {}

    // Brief delay for UX feedback
    await new Promise((r) => setTimeout(r, 300));
    setSaving(false);
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
          {APP.SETTINGS_PROFILE.title}
        </h2>
        <p
          className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)] mt-1"
          style={{ color: "var(--text-tertiary)" }}
        >
          {APP.SETTINGS_PROFILE.subtitle}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: ELEMENT_ENTER, ease: [...ease] }}
        className="space-y-5"
      >
        {/* Niche */}
        <FormControl label={APP.SETTINGS_PROFILE.nicheLabel} caption={APP.SETTINGS_PROFILE.nichePlaceholder}>
          <Input
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            size={SIZE.default}
            overrides={{ Input: { props: { maxLength: 120 } } }}
          />
        </FormControl>

        {/* Audience */}
        <FormControl label={APP.SETTINGS_PROFILE.audienceLabel}>
          <Input
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            size={SIZE.default}
            overrides={{ Input: { props: { maxLength: 120 } } }}
          />
        </FormControl>

        {/* Tone */}
        <div>
          <p
            className="text-[var(--type-supporting-desktop)] font-medium mb-1"
            style={{ color: "var(--text-secondary)" }}
          >
            {APP.SETTINGS_PROFILE.toneLabel}
          </p>
          <p
            className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)] mb-3"
            style={{ color: "var(--text-tertiary)" }}
          >
            {APP.SETTINGS_PROFILE.toneDescription}
          </p>
          <Card className="p-0 overflow-hidden">
            {APP.TONES.map((t, i) => (
              <ListRow
                key={t.id}
                interactive
                noBorder={i === APP.TONES.length - 1}
                onClick={() => setTone(TONE_MAP[t.id] ?? t.id as ContentTone)}
                supporting={t.description}
                left={
                  <div
                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                    style={{
                      borderColor:
                        tone === (TONE_MAP[t.id] ?? t.id)
                          ? "var(--accent)"
                          : "var(--border-default)",
                    }}
                  >
                    {tone === (TONE_MAP[t.id] ?? t.id) && (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: "var(--accent)" }}
                      />
                    )}
                  </div>
                }
                className={
                  tone === (TONE_MAP[t.id] ?? t.id)
                    ? "bg-[var(--accent-subtle)]"
                    : ""
                }
              >
                {t.label}
              </ListRow>
            ))}
          </Card>
        </div>

        {/* Voice preferences */}
        <FormControl label={`${APP.SETTINGS_PROFILE.voicePrefsLabel} ${APP.SETTINGS_PROFILE.voicePrefsOptional}`}>
          <Textarea
            value={voiceNotes}
            onChange={(e) => setVoiceNotes(e.target.value)}
            placeholder={APP.SETTINGS_PROFILE.voicePrefsPlaceholder}
            size={TA_SIZE.default}
            overrides={{
              Input: {
                props: { rows: 3, maxLength: 400 },
                style: { resize: "none" as const },
              },
            }}
          />
        </FormControl>

        {/* Save button */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            isLoading={saving}
          >
            {saving ? APP.SETTINGS_PROFILE.saving : APP.SETTINGS_PROFILE.saveCta}
          </Button>
          {saved && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)]"
              style={{ color: "var(--accent)" }}
            >
              {APP.SETTINGS_PROFILE.saved}
            </motion.span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
