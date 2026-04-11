"use client";

import { Sidebar } from "./Sidebar";
import { IconRail } from "./IconRail";
import { TopNav } from "./TopNav";
import { MobileHeader } from "./MobileHeader";
import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Responsive app shell — three layout tiers via CSS only (no hydration mismatch).
 *
 * Mobile  (< 768px):  MobileHeader + BottomNav, no sidebar
 * Tablet  (768–1023):  IconRail (64px) + TopNav
 * Desktop (1024+):     Sidebar (240px) + TopNav
 *
 * All components are always rendered; CSS controls visibility.
 */
export function AppShell({ children }: AppShellProps): React.ReactElement {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-page)" }}>
      {/* Sidebar — hidden below tablet-lg (1024px) via its own CSS */}
      <Sidebar />

      {/* Icon rail — visible only at tablet-sm to tablet-lg via its own CSS */}
      <IconRail />

      {/* Mobile header — hidden at tablet-sm+ via its own CSS */}
      <MobileHeader />

      {/* Top nav — hidden on mobile via wrapper */}
      <div className="hidden tablet-sm:block">
        <TopNav />
      </div>

      {/* Main content area — CSS margins match the visible sidebar */}
      <div
        className={[
          "flex flex-col min-h-screen",
          /* Mobile: top padding for MobileHeader, bottom for BottomNav */
          "pt-[56px] pb-[calc(56px+env(safe-area-inset-bottom))]",
          /* Tablet: left margin for IconRail, reset vertical padding */
          "tablet-sm:ml-[64px] tablet-sm:pt-0 tablet-sm:pb-0",
          /* Desktop: left margin for Sidebar */
          "tablet-lg:ml-[240px]",
        ].join(" ")}
      >
        {/* TopNav spacer — only on tablet+ where TopNav is visible */}
        <div className="hidden tablet-sm:block" style={{ height: 75 }} />

        <main
          className="flex-1 px-4 pt-6 tablet-sm:px-8 tablet-sm:pt-8 tablet-lg:px-10 tablet-lg:pt-10"
          style={{ width: "100%", maxWidth: 1080, margin: "0 auto" }}
        >
          {children}
        </main>
      </div>

      {/* Bottom navigation — hidden at tablet-sm+ via its own CSS */}
      <BottomNav />
    </div>
  );
}
