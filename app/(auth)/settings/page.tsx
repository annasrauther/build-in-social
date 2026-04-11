import Link from "next/link";
import { APP } from "@/content/app";
import { Card } from "@/components/ui/Card";
import { ListRow } from "@/components/ui/ListRow";

const settingsLinks = [
  { href: "/settings/profile", label: APP.SETTINGS.profileLabel, description: APP.SETTINGS.profileDescription },
  { href: "/settings/platforms", label: APP.SETTINGS.platformsLabel, description: APP.SETTINGS.platformsDescription },
  { href: "/settings/voice", label: APP.SETTINGS.voiceLabel, description: APP.SETTINGS.voiceDescription },
  { href: "/settings/billing", label: APP.SETTINGS.billingLabel, description: APP.SETTINGS.billingDescription },
];

export default function SettingsPage(): React.ReactElement {
  return (
    <div className="space-y-6 max-w-3xl">
      <h2
        className="text-[var(--type-section-mobile)] tablet-sm:text-[var(--type-section-desktop)]"
        style={{ fontFamily: "var(--font-heading)", fontWeight: 400, color: "var(--text-primary)" }}
      >
        {APP.SETTINGS.title}
      </h2>

      <Card className="p-0 overflow-hidden">
        {settingsLinks.map((item, i) => (
          <Link key={item.href} href={item.href} className="block">
            <ListRow
              interactive
              noBorder={i === settingsLinks.length - 1}
              supporting={item.description}
              right={
                <span
                  className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)]"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  →
                </span>
              }
            >
              {item.label}
            </ListRow>
          </Link>
        ))}
      </Card>
    </div>
  );
}
