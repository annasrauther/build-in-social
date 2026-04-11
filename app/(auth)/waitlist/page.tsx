"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ease, ELEMENT_ENTER } from "@/lib/motion";
import { APP } from "@/content/app";
import { Card } from "@/components/ui/Card";
import { Input, SIZE } from "baseui/input";
import { FormControl } from "baseui/form-control";
import { Button, KIND, SIZE as BTN_SIZE } from "baseui/button";
import { Badge } from "@/components/ui/Badge";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError(APP.WAITLIST.emailError);
      return;
    }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md text-center"
      >
        {/* Badge */}
        <div className="mb-6">
          <Badge variant="default">{APP.WAITLIST.badge}</Badge>
        </div>

        <h1
          className="text-[var(--type-display-mobile)] tablet-sm:text-[var(--type-display-desktop)] mb-3 leading-[1.1]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 400, color: "var(--text-primary)" }}
        >
          {APP.WAITLIST.title}
        </h1>

        <p
          className="text-[var(--type-body-mobile)] tablet-sm:text-[var(--type-body-desktop)] leading-[1.65] mb-2"
          style={{ color: "var(--text-secondary)" }}
        >
          {APP.WAITLIST.headline}
        </p>

        <p
          className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)] mb-8"
          style={{ color: "var(--text-tertiary)" }}
        >
          {APP.WAITLIST.description}
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <FormControl error={error || undefined}>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder={APP.WAITLIST.emailPlaceholder}
                    error={!!error}
                    size={SIZE.default}
                  />
                </FormControl>
              </div>
              <Button
                type="submit"
                isLoading={loading}
                overrides={{ BaseButton: { style: { whiteSpace: "nowrap", alignSelf: "flex-start" } } }}
              >
                {loading ? APP.WAITLIST.joining : APP.WAITLIST.joinCta}
              </Button>
            </div>
            <p
              className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)]"
              style={{ color: "var(--text-tertiary)" }}
            >
              {APP.WAITLIST.noSpam}
            </p>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: ELEMENT_ENTER, ease: [...ease] }}
          >
            <Card className="border-[var(--accent)] bg-[var(--accent-subtle)]">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: "var(--accent)" }}
              >
                <svg width="16" height="13" viewBox="0 0 16 13" fill="none">
                  <path d="M1 6.5L5.5 11L15 1" stroke="var(--text-inverse)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p
                className="text-[var(--type-body-mobile)] tablet-sm:text-[var(--type-body-desktop)] font-medium mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                {APP.WAITLIST.successTitle}
              </p>
              <p
                className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)]"
                style={{ color: "var(--text-secondary)" }}
              >
                {APP.WAITLIST.successDescription(email)}
              </p>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
