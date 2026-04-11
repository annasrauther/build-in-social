"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button, KIND, SIZE } from "baseui/button";
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
      className="rounded-[var(--radius-lg)] p-5 mt-4"
      style={{ backgroundColor: "var(--bg-elevated)" }}
    >
      <div className="flex gap-4">
        {/* Left: metadata */}
        <div className="flex-1 min-w-0">
          {/* Product name row with favicon */}
          <div className="flex items-center gap-2.5 mb-1">
            {!faviconError ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={faviconUrl}
                alt=""
                width={20}
                height={20}
                className="shrink-0 rounded"
                onError={() => setFaviconError(true)}
              />
            ) : (
              <div
                className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                style={{ backgroundColor: "var(--bg-overlay)" }}
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="5.5" stroke="var(--text-disabled)" strokeWidth="1" />
                  <path d="M7 1.5C7 1.5 4 4 4 7s3 5.5 3 5.5M7 1.5c0 0 3 2.5 3 5.5s-3 5.5-3 5.5M2 7h10" stroke="var(--text-disabled)" strokeWidth="0.8" />
                </svg>
              </div>
            )}

            <p
              className="text-[var(--type-body-mobile)] font-semibold truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {name}
            </p>
          </div>

          {/* Domain + source badge */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[var(--type-supporting-mobile)] truncate"
              style={{ fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--text-tertiary)" }}
            >
              {domain}
            </span>
            {sourceLabel && (
              <span
                className="text-[var(--type-micro)] font-medium px-1.5 py-0.5 rounded shrink-0"
                style={{
                  backgroundColor: "var(--accent-subtle)",
                  color: "var(--text-secondary)",
                }}
              >
                {sourceLabel}
              </span>
            )}
            {isPartialMatch && (
              <span
                className="text-[var(--type-micro)] font-medium px-1.5 py-0.5 rounded shrink-0"
                style={{
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
            className="text-[var(--type-body-mobile)] leading-relaxed line-clamp-2"
            style={{ color: "var(--text-secondary)" }}
          >
            {description}
          </p>
        </div>

        {/* Right: OG image */}
        {ogImage && !imgError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease, delay: 0.15 }}
            className="shrink-0 self-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ogImage}
              alt=""
              className="rounded-[var(--radius-md)]"
              style={{ width: 72, height: 54, objectFit: "cover" }}
              onError={() => setImgError(true)}
            />
          </motion.div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-4">
        <Button size={SIZE.compact} onClick={onConfirm}>
          That&apos;s right
        </Button>
        <Button kind={KIND.tertiary} size={SIZE.compact} onClick={onReject}>
          Not quite &mdash; I&apos;ll describe it
        </Button>
      </div>
    </motion.div>
  );
}
