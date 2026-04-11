"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { navItems, Lock } from "@/lib/constants/navigation";

export function BottomNav(): React.ReactElement {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 tablet-sm:hidden"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderTop: "1px solid var(--border-subtle)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-center justify-around" style={{ height: 56 }}>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.locked ? "#" : item.href}
              className={clsx(
                "relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full",
                item.locked && "pointer-events-none"
              )}
              aria-label={item.mobileLabel}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomnav-pill"
                  className="absolute inset-x-2 top-1 bottom-1 rounded-[var(--radius-md)]"
                  style={{ backgroundColor: "var(--accent-subtle)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <div className="relative z-10">
                <item.icon
                  size={20}
                  style={{
                    color: isActive
                      ? "var(--accent)"
                      : item.locked
                        ? "var(--text-disabled)"
                        : "var(--text-tertiary)",
                  }}
                />
                {item.locked && (
                  <Lock
                    size={8}
                    className="absolute -top-0.5 -right-1"
                    style={{ color: "var(--text-disabled)" }}
                  />
                )}
              </div>
              <span
                className="relative z-10 text-[10px] font-medium leading-none"
                style={{
                  color: isActive
                    ? "var(--accent)"
                    : item.locked
                      ? "var(--text-disabled)"
                      : "var(--text-tertiary)",
                }}
              >
                {item.mobileLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
