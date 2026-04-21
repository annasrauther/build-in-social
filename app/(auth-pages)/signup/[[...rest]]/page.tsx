"use client";

import { SignUp } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ELEMENT_ENTER, ease } from "@/lib/motion";
import { Button } from "@/components/tremor/Button";
import { clerkAppearance } from "@/lib/clerk-appearance";

const devAuth = process.env.NEXT_PUBLIC_DEV_AUTH === "1";
const hasClerk = !devAuth && !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function SignUpPage() {
  const theme = "dark" as const;
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: "var(--bg-page)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <motion.div
          className="flex items-center justify-center gap-2.5 mb-8"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: ELEMENT_ENTER, ease: [...ease] }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <span className="text-[16px] font-bold" style={{ color: "var(--text-inverse)" }}>B</span>
          </div>
          <span
            className="text-[24px] font-medium tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Build In Social
          </span>
        </motion.div>

        {devAuth ? (
          <form
            method="POST"
            action="/api/dev/login?to=/onboarding"
            className="rounded-[var(--radius-lg)] p-6 sm:p-8 text-center"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
            }}
          >
            <h1
              className="text-[18px] font-medium mb-2 font-sans"
              style={{ color: "var(--text-primary)" }}
            >
              Demo mode
            </h1>
            <p
              className="text-[14px] mb-6"
              style={{ color: "var(--text-secondary)" }}
            >
              Demo mode — sign in as demo user.
            </p>
            <Button type="submit" className="w-full">
              Continue as demo user
            </Button>
          </form>
        ) : hasClerk ? (
          <div className="flex justify-center">
            <SignUp
              fallbackRedirectUrl="/onboarding"
              appearance={clerkAppearance(theme)}
            />
          </div>
        ) : (
          <div
            className="rounded-[var(--radius-lg)] p-6 sm:p-8 text-center"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
            }}
          >
            <h1
              className="text-[18px] font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Create account
            </h1>
            <p
              className="text-[14px] mb-6"
              style={{ color: "var(--text-secondary)" }}
            >
              Set CLERK_PUBLISHABLE_KEY or NEXT_PUBLIC_DEV_AUTH=1 to enable
              authentication.
            </p>
            <a
              href="/onboarding"
              className="inline-block px-6 py-3 rounded-lg font-medium"
              style={{
                backgroundColor: "var(--accent)",
                color: "var(--text-inverse)",
              }}
            >
              Start onboarding (dev mode)
            </a>
          </div>
        )}
      </motion.div>
    </div>
  );
}
