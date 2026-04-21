"use client";

/**
 * QuotaExhaustedDialog — shown when a video render is blocked because the user
 * hit their monthly hard cap. Never surprise-charges. Offers two honest
 * options: upgrade to next tier, or wait until the monthly reset.
 *
 * Called from the plan/current approve flows when /api/render/faceless
 * returns 402 with `{ error: "quota_exhausted", tier, cap, resetAt, upgradeTo }`.
 */

import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tremor/Dialog";
import { Button } from "@/components/tremor/Button";
import { APP } from "@/content/app";
import type { SubscriptionTier } from "@/lib/types/user";

export interface QuotaExhaustedDetails {
  tier: SubscriptionTier;
  cap: number;
  resetAt: string; // ISO
  upgradeTo: SubscriptionTier | null;
}

const TIER_LABEL: Record<SubscriptionTier, string> = {
  trial: "Trial",
  starter: "Starter",
  solo: "Solo",
  creator: "Creator",
  studio: "Studio",
};

function formatResetDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
    });
  } catch {
    return "next month";
  }
}

export function QuotaExhaustedDialog({
  open,
  onOpenChange,
  details,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  details: QuotaExhaustedDetails | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && details && (
          <DialogContent>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <DialogHeader>
                <DialogTitle>{APP.QUOTA.dialogTitle(details.cap)}</DialogTitle>
                <DialogDescription className="mt-2">
                  {APP.QUOTA.dialogBody(
                    details.upgradeTo ? TIER_LABEL[details.upgradeTo] : null,
                    formatResetDate(details.resetAt),
                  )}
                </DialogDescription>
              </DialogHeader>

              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                {APP.QUOTA.noSurpriseCharges}
              </p>

              <DialogFooter className="mt-6 gap-2">
                <Button variant="secondary" onClick={() => onOpenChange(false)}>
                  {APP.QUOTA.waitCta}
                </Button>
                {details.upgradeTo ? (
                  <Button asChild>
                    <Link href="/settings/billing">
                      {APP.QUOTA.upgradeCta(TIER_LABEL[details.upgradeTo])}
                    </Link>
                  </Button>
                ) : (
                  <Button asChild>
                    <Link href="/settings/billing">
                      {APP.SETTINGS_BILLING.manageBilling}
                    </Link>
                  </Button>
                )}
              </DialogFooter>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
