"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/tremor/Button";
import { Input } from "@/components/tremor/Input";
import { Badge } from "@/components/tremor/Badge";
import { ArrowAnimated } from "@/components/marketing/ArrowAnimated";
import { APP } from "@/content/app";

type State = "idle" | "submitting" | "success" | "error";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setState("submitting");
    try {
      const res = await fetch("/api/waitlist/avatar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setErrorMsg(json.error ?? APP.WAITLIST.emailError);
        setState("error");
        return;
      }
      setSubmittedEmail(email.trim());
      setState("success");
    } catch {
      setErrorMsg(APP.COMMON.errorGeneric);
      setState("error");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
      <Badge variant="default" className="mb-4">
        {APP.WAITLIST.badge}
      </Badge>
      <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-gray-900 dark:text-gray-50">
        {APP.WAITLIST.title}
      </h1>
      <p className="mt-6 text-lg text-gray-600 dark:text-gray-400">
        {APP.WAITLIST.headline}
      </p>
      <p className="mt-3 text-sm text-gray-500 dark:text-gray-500">
        {APP.WAITLIST.description}
      </p>

      <section className="mt-10" aria-labelledby="waitlist-how">
        <h2
          id="waitlist-how"
          className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
        >
          {APP.WAITLIST.howItWorksLabel}
        </h2>
        <ol className="mt-4 space-y-3">
          {APP.WAITLIST.howItWorks.map((step, i) => (
            <li
              key={i}
              className="flex gap-3 text-sm text-gray-700 dark:text-gray-300"
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-medium text-gray-50 dark:bg-gray-50 dark:text-gray-900"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <span className="leading-6">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10" aria-labelledby="waitlist-specs">
        <h2
          id="waitlist-specs"
          className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
        >
          {APP.WAITLIST.specsLabel}
        </h2>
        <ul className="mt-4 space-y-2">
          {APP.WAITLIST.specs.map((spec, i) => (
            <li
              key={i}
              className="flex gap-3 text-sm text-gray-700 dark:text-gray-300"
            >
              <span
                className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-gray-500"
                aria-hidden="true"
              />
              <span className="leading-6">{spec}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-8 text-sm text-gray-600 dark:text-gray-400">
        {APP.WAITLIST.targetAudience}
      </p>

      <div className="mt-10">
        <AnimatePresence mode="wait">
          {state === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-950/30"
            >
              <h2 className="text-base font-medium text-green-900 dark:text-green-200">
                {APP.WAITLIST.successTitle}
              </h2>
              <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                {APP.WAITLIST.successDescription(submittedEmail)}
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="space-y-3"
            >
              <Input
                type="email"
                required
                placeholder={APP.WAITLIST.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={state === "submitting"}
                autoComplete="email"
                aria-label="Email address"
              />
              {errorMsg && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errorMsg}
                </p>
              )}
              <Button
                type="submit"
                disabled={state === "submitting" || !email.trim()}
                className="group w-full"
              >
                {state === "submitting"
                  ? APP.WAITLIST.joining
                  : APP.WAITLIST.joinCta}
                {state !== "submitting" && <ArrowAnimated />}
              </Button>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {APP.WAITLIST.waitlistPerk}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {APP.WAITLIST.noSpam}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {APP.WAITLIST.cohortNote}
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
