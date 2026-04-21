import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";
import { LANDING } from "@/content/landing";

const LINKS: readonly { name: string; href: string }[] = [
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
  { name: "Privacy", href: "/privacy" },
  { name: "Terms", href: "/terms" },
  { name: "Support", href: "mailto:support@buildinsocial.com" },
  { name: "Data partners", href: "/subprocessors" },
  { name: "Data residency", href: "/subprocessors#residency" },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-[color:var(--divider)]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Wordmark size={16} />
            {LINKS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                prefetch
                className="py-1.5 px-1 text-[12px] text-text-secondary hover:text-text transition-colors duration-fast ease-out-cubic rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[outline-color:var(--focus-ring)]"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {LANDING.FOOTER.dataLine ? (
          <p className="mt-4 text-[11px] text-text-tertiary">
            {LANDING.FOOTER.dataLine}
          </p>
        ) : null}

        <p className="mt-2 text-[11px] text-text-tertiary tabular-nums">
          &copy; {new Date().getFullYear()} Build In Social. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
