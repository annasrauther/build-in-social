"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/tremor/Button";
import { DURATION_ENTRY, EASE_SPRING } from "@/lib/constants/onboarding";
import type { InferProductSource } from "@/lib/types/infer-product";

const ease = [...EASE_SPRING] as [number, number, number, number];

const SOURCE_LABELS: Record<InferProductSource, string> = {
  og: "Open Graph",
  title: "Page title",
  freetext: "Manual",
  none: "",
};

interface DomainPreviewCardProps {
  domain: string;
  name: string;
  description: string;
  ogImage?: string;
  faviconUrl: string;
  source?: InferProductSource;
  confidence?: number;
  onConfirm: () => void;
  onReject: () => void;
}

export function DomainPreviewCard({
  domain,
  name,
  description,
  ogImage,
  faviconUrl,
  source = "og",
  confidence = 1,
  onConfirm,
  onReject,
}: DomainPreviewCardProps) {
  const [imgError, setImgError] = useState(false);
  const [faviconError, setFaviconError] = useState(false);

  const sourceLabel = SOURCE_LABELS[source];
  const isPartialMatch = confidence >= 0.4 && confidence < 0.8;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION_ENTRY, ease }}
      className="mt-4"
      style={{
        /* Gradient border via padding trick */
        background: "linear-gradient(var(--bg-elevated), var(--bg-elevated)) padding-box, linear-gradient(135deg, rgba(217,119,87,0.5) 0%, rgba(217,119,87,0.08) 60%, transparent 100%) border-box",
        border: "1.5px solid transparent",
        borderRadius: "var(--radius-lg)",
        padding: "18px 20px",
        backdropFilter: "blur(8px)",
        boxShadow: "0 4px 24px rgba(217,119,87,0.08), 0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header row: favicon + name + OG image */}
      <div className="flex gap-4 items-start">
        <div className="flex-1 min-w-0">
          {/* Product name row */}
          <div className="flex items-center gap-2.5 mb-1.5">
            {!faviconError ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={faviconUrl}
                alt=""
                width={18}
                height={18}
                className="shrink-0 rounded"
                onError={() => setFaviconError(true)}
              />
            ) : (
              <div
                className="w-[18px] h-[18px] rounded flex items-center justify-center shrink-0"
                style={{ backgroundColor: "var(--bg-overlay)" }}
              >
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="5.5" stroke="var(--text-disabled)" strokeWidth="1" />
                  <path d="M7 1.5C7 1.5 4 4 4 7s3 5.5 3 5.5M7 1.5c0 0 3 2.5 3 5.5s-3 5.5-3 5.5M2 7h10" stroke="var(--text-disabled)" strokeWidth="0.8" />
                </svg>
              </div>
            )}

            <p
              className="font-semibold truncate"
              style={{
                fontSize: "var(--type-body-mobile)",
                color: "var(--text-primary)",
              }}
            >
              {name}
            </p>
          </div>

          {/* Domain + badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span
              className="font-mono font-medium opacity-80"
              style={{
                fontSize: "var(--type-supporting-mobile)",
                color: "var(--accent)",
              }}
            >
              {domain}
            </span>
            {sourceLabel && (
              <span
                className="font-medium px-[7px] py-[2px] rounded-full border border-[rgba(217,119,87,0.2)]"
                style={{
                  fontSize: "var(--type-micro)",
                  backgroundColor: "var(--accent-subtle)",
                  color: "var(--accent)",
                }}
              >
                {sourceLabel}
              </span>
            )}
            {isPartialMatch && (
              <span
                className="font-medium px-[7px] py-[2px] rounded-full"
                style={{
                  fontSize: "var(--type-micro)",
                  backgroundColor: "var(--warning-subtle)",
                  color: "var(--warning)",
                }}
              >
                Partial match
              </span>
            )}
          </div>

          {/* Description */}
          <p
            className="leading-relaxed"
            style={{
              fontSize: "var(--type-body-mobile)",
              color: "var(--text-secondary)",
            }}
          >
            {description}
          </p>
        </div>

        {/* OG image */}
        {ogImage && !imgError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease, delay: 0.15 }}
            className="shrink-0 self-start"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ogImage}
              alt=""
              style={{
                width: 72,
                height: 54,
                objectFit: "cover",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-default)",
              }}
              onError={() => setImgError(true)}
            />
          </motion.div>
        )}
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          backgroundColor: "var(--border-subtle)",
          margin: "14px 0",
        }}
      />

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button className="text-sm" onClick={onConfirm}>
          That&apos;s right
        </Button>
        <Button variant="ghost" className="text-sm" onClick={onReject}>
          Not quite &mdash; I&apos;ll describe it
        </Button>
      </div>
    </motion.div>
  );
}
