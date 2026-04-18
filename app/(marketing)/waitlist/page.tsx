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
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {APP.WAITLIST.noSpam}
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
