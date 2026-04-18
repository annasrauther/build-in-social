"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiAddLine, RiArrowDownSLine, RiCheckLine, RiCloseLine } from "@remixicon/react";
import { PremiumInput } from "@/components/onboarding/PremiumInput";
import { PremiumTextarea } from "@/components/onboarding/PremiumTextarea";
import { Button } from "@/components/tremor/Button";
import { APP } from "@/content/app";
import type { IngestSourceType, IngestResult, IngestTopicCandidate } from "@/lib/types/ingest";

const TYPES: { id: IngestSourceType; label: string }[] = [
  { id: "notion", label: APP.ONBOARDING.step1.ingestTypeNotion },
  { id: "transcript", label: APP.ONBOARDING.step1.ingestTypeTranscript },
  { id: "rss", label: APP.ONBOARDING.step1.ingestTypeRss },
];

type Status = "idle" | "loading" | "success" | "error";

interface Props {
  onTopicsExtracted: (topics: IngestTopicCandidate[], sourceType: IngestSourceType) => void;
  initialTopics?: IngestTopicCandidate[];
  initialSourceType?: IngestSourceType;
}

export function SourceIngestPanel({
  onTopicsExtracted,
  initialTopics,
  initialSourceType,
}: Props) {
  const copy = APP.ONBOARDING.step1;
  const [open, setOpen] = useState<boolean>(!!initialTopics?.length);
  const [sourceType, setSourceType] = useState<IngestSourceType>(initialSourceType ?? "notion");
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>(initialTopics?.length ? "success" : "idle");
  const [topics, setTopics] = useState<IngestTopicCandidate[]>(initialTopics ?? []);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);

  const placeholder = useMemo(() => {
    if (sourceType === "notion") return copy.ingestNotionPlaceholder;
    if (sourceType === "rss") return copy.ingestRssPlaceholder;
    return copy.ingestTranscriptPlaceholder;
  }, [sourceType, copy]);

  const canSubmit = useMemo(() => {
    const v = input.trim();
    if (sourceType === "transcript") return v.length >= 80;
    return v.length >= 8;
  }, [input, sourceType]);

  const resolveErrorMessage = useCallback(
    (code: string | undefined): string => {
      switch (code) {
        case "rate_limited":
          return copy.ingestErrorRateLimit;
        case "source_private":
        case "source_unreachable":
          if (sourceType === "notion") return copy.ingestErrorNotion;
          if (sourceType === "rss") return copy.ingestErrorRss;
          return copy.ingestErrorGeneric;
        case "source_empty":
        case "invalid_input":
          if (sourceType === "transcript") return copy.ingestErrorTranscript;
          if (sourceType === "notion") return copy.ingestErrorNotion;
          if (sourceType === "rss") return copy.ingestErrorRss;
          return copy.ingestErrorGeneric;
        default:
          return copy.ingestErrorGeneric;
      }
    },
    [copy, sourceType]
  );

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || status === "loading") return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceType, input: input.trim() }),
        signal: controller.signal,
      });
      const json = (await res.json()) as {
        data: IngestResult | null;
        error: { code?: string; message?: string } | null;
      };
      if (!res.ok || !json.data) {
        setStatus("error");
        setErrorMsg(resolveErrorMessage(json.error?.code));
        return;
      }
      setTopics(json.data.topics);
      setStatus("success");
      onTopicsExtracted(json.data.topics, sourceType);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setStatus("error");
      setErrorMsg(copy.ingestErrorGeneric);
    }
  }, [canSubmit, status, sourceType, input, onTopicsExtracted, copy, resolveErrorMessage]);

  const handleTypeChange = useCallback((id: IngestSourceType) => {
    setSourceType(id);
    setInput("");
    setStatus("idle");
    setErrorMsg("");
  }, []);

  return (
    <div style={{ marginTop: 4 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          fontWeight: 500,
          color: "var(--accent)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          textDecoration: "underline",
          textUnderlineOffset: 3,
        }}
        aria-expanded={open}
      >
        {open ? <RiCloseLine style={{ width: 14, height: 14 }} /> : <RiAddLine style={{ width: 14, height: 14 }} />}
        {copy.ingestLabel}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="ingest-body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                marginTop: 10,
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                padding: 16,
                backgroundColor: "var(--bg-elevated)",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-tertiary)",
                  lineHeight: 1.5,
                  marginBottom: 12,
                }}
              >
                {copy.ingestHint}
              </p>

              {/* Type selector */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {TYPES.map((t) => {
                  const active = sourceType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleTypeChange(t.id)}
                      style={{
                        fontSize: 12,
                        fontWeight: active ? 600 : 500,
                        color: active ? "var(--accent)" : "var(--text-secondary)",
                        backgroundColor: active ? "rgba(217,119,87,0.08)" : "var(--bg-surface)",
                        border: `1.5px solid ${active ? "var(--accent)" : "var(--border-default)"}`,
                        borderRadius: 99,
                        padding: "6px 12px",
                        minHeight: 32,
                        cursor: "pointer",
                        transition: "border-color 130ms ease, background-color 130ms ease, color 130ms ease",
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Input */}
              {sourceType === "transcript" ? (
                <PremiumTextarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={placeholder}
                  rows={5}
                  disabled={status === "loading"}
                />
              ) : (
                <PremiumInput
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={placeholder}
                  disabled={status === "loading"}
                />
              )}

              {/* Submit */}
              <div className="mt-3 flex items-center gap-3">
                <Button
                  className="text-sm"
                  disabled={!canSubmit || status === "loading"}
                  onClick={handleSubmit}
                >
                  {status === "loading" ? copy.ingestLoading : copy.ingestSubmitCta}
                </Button>
                {status === "loading" && (
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="block rounded-full"
                        style={{ width: 4, height: 4, backgroundColor: "var(--accent)" }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Error */}
              <AnimatePresence>
                {status === "error" && errorMsg && (
                  <motion.p
                    key="err"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      marginTop: 10,
                      fontSize: 12,
                      color: "var(--danger, #C2410C)",
                      lineHeight: 1.5,
                    }}
                  >
                    {errorMsg}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Success: chips preview */}
              <AnimatePresence>
                {status === "success" && topics.length > 0 && (
                  <motion.div
                    key="ok"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ marginTop: 14 }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--success, #15803D)",
                        backgroundColor: "var(--success-subtle, rgba(34,197,94,0.12))",
                        padding: "4px 10px",
                        borderRadius: 99,
                        marginBottom: 10,
                      }}
                    >
                      <RiCheckLine style={{ width: 12, height: 12 }} />
                      {copy.ingestSuccess(topics.length)}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {topics.map((t, i) => (
                        <span
                          key={`${t.title}-${i}`}
                          title={t.hookIdea}
                          style={{
                            fontSize: 12,
                            color: "var(--text-primary)",
                            backgroundColor: "var(--bg-surface)",
                            border: "1px solid var(--border-default)",
                            borderRadius: 99,
                            padding: "6px 10px",
                            maxWidth: "100%",
                          }}
                          className="truncate"
                        >
                          {t.title}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tiny down-arrow flourish when closed */}
      {!open && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          aria-hidden
          style={{
            display: "inline-flex",
            marginLeft: 4,
            color: "var(--text-disabled)",
            verticalAlign: "middle",
          }}
        >
          <RiArrowDownSLine style={{ width: 14, height: 14 }} />
        </motion.span>
      )}
    </div>
  );
}
