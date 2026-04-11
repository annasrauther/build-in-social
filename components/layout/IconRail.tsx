"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { Settings, Lock } from "lucide-react";
import { navItems } from "@/lib/constants/navigation";
import { Badge } from "@/components/ui/Badge";
import { Wordmark } from "@/components/ui/Wordmark";
import { navPillTransition } from "@/lib/motion";

export function IconRail(): React.ReactElement {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <aside
      className="hidden tablet-sm:flex tablet-lg:hidden fixed left-0 top-0 bottom-0 flex-col items-center"
      style={{
        width: 64,
        backgroundColor: "var(--bg-surface)",
        borderRight: "1px solid var(--border-subtle)",
      }}
    >
      {/* Logo */}
      <div className="py-4">
        <Link href="/" style={{ textDecoration: "none" }}>
          <Wordmark size={14} />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-1 px-2 pt-2">
        {navItems.filter((item) => item.href !== "/settings").map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <div
              key={item.href}
              className="relative"
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {isActive && (
                <motion.div
                  layoutId="iconrail-pill"
                  className="absolute inset-0 rounded-[var(--radius-md)]"
                  style={{ backgroundColor: "var(--bg-elevated)" }}
                  transition={navPillTransition}
                />
              )}
              <Link
                href={item.locked ? "#" : item.href}
                className={clsx(
                  "relative z-10 flex items-center justify-center transition-colors",
                  item.locked && "pointer-events-none"
                )}
                style={{
                  width: 44,
                  height: 44,
                  color: isActive
                    ? "var(--accent)"
                    : item.locked
                      ? "var(--text-disabled)"
                      : "var(--text-secondary)",
                }}
                aria-label={item.label}
                title={item.label}
              >
                <item.icon size={20} />
                {item.locked && (
                  <Lock
                    size={10}
                    className="absolute top-1.5 right-1.5"
                    style={{ color: "var(--text-disabled)" }}
                  />
                )}
              </Link>

              {/* Tooltip */}
              <AnimatePresence>
                {hoveredItem === item.href && (
                  <motion.div
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 rounded-[var(--radius-sm)] text-[12px] font-medium whitespace-nowrap z-50 pointer-events-none"
                    style={{
                      backgroundColor: "var(--text-primary)",
                      color: "var(--text-inverse)",
                    }}
                  >
                    {item.label}
                    {item.locked && " (locked)"}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="pb-4 flex flex-col items-center gap-2">
        <div
          className="w-10 border-t"
          style={{ borderColor: "var(--border-subtle)" }}
        />
        <Link
          href="/settings"
          className="flex items-center justify-center transition-colors"
          style={{
            width: 40,
            height: 40,
            color: pathname.startsWith("/settings")
              ? "var(--accent)"
              : "var(--text-secondary)",
          }}
          aria-label="Settings"
          title="Settings"
        >
          <Settings size={20} />
        </Link>
      </div>
    </aside>
  );
}
