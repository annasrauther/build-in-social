import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";
import { LANDING } from "@/content/landing";

/**
 * Footer — Medium-style minimal.
 * Logo left, horizontal links right, single border top.
 */
export function LandingFooter() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(0,0,0,0.08)",
        padding: "40px 24px",
      }}
    >
      <div className="lp-container lp-footer-inner">
        <Wordmark size={22} />

        <div
          className="flex items-center flex-wrap gap-6"
          style={{
            fontFamily: "var(--lp-sans)",
            fontSize: 14,
            color: "var(--lp-text-secondary)",
          }}
        >
          {LANDING.FOOTER.links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              style={{
                color: "var(--lp-text-secondary)",
                textDecoration: "none",
              }}
            >
              {link.label}
            </Link>
          ))}
          <span>{LANDING.FOOTER.copyright}</span>
        </div>
      </div>
    </footer>
  );
}
