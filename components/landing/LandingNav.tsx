"use client";

import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";
import { Button, SIZE } from "baseui/button";
import { Container } from "@/components/ui/Container";
import { LANDING } from "@/content/landing";

export function LandingNav() {
  return (
    <header
      className="sticky top-0 z-50"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <Container size="wide">
        <div
          className="flex items-center justify-between"
          style={{ height: 75 }}
        >
          {/* Logo */}
          <Link href="/" aria-label="Build In Social">
            <Wordmark size={22} />
          </Link>

          {/* Center links — hidden mobile */}
          <nav className="hidden tablet-sm:flex items-center gap-8">
            {LANDING.NAV.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[var(--type-body-mobile)] tablet-sm:text-[var(--type-body-desktop)] transition-opacity hover:opacity-70"
                style={{ color: "var(--text-secondary)", textDecoration: "none" }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right: sign in + CTA */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden tablet-sm:inline text-[var(--type-body-mobile)] tablet-sm:text-[var(--type-body-desktop)] transition-opacity hover:opacity-70"
              style={{ color: "var(--text-secondary)", textDecoration: "none" }}
            >
              {LANDING.NAV.signInLabel}
            </Link>
            <Link href="/onboarding/start">
              <Button size={SIZE.compact}>
                {LANDING.NAV.ctaLabel}
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
}
