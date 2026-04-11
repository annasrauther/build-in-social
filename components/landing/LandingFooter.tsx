import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";
import { Container } from "@/components/ui/Container";
import { LANDING } from "@/content/landing";

export function LandingFooter() {
  return (
    <footer
      className="py-10"
      style={{ borderTop: "1px solid var(--border-default)" }}
    >
      <Container size="wide">
        <div className="flex flex-col tablet-sm:flex-row tablet-sm:items-center tablet-sm:justify-between gap-6">
          {/* Logo */}
          <Wordmark size={22} />

          {/* Links */}
          <div className="flex flex-wrap items-center gap-6">
            {LANDING.FOOTER.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: "var(--type-body-mobile)",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                }}
                className="transition-opacity hover:opacity-70"
              >
                {link.label}
              </Link>
            ))}
            <span
              style={{
                fontSize: "var(--type-body-mobile)",
                color: "var(--text-tertiary)",
              }}
            >
              {LANDING.FOOTER.copyright}
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
