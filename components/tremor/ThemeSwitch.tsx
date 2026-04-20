"use client"

import { cx, focusRing } from "@/lib/utils"
import { RiComputerLine, RiMoonLine, RiSunLine } from "@remixicon/react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import React, { useEffect, useState } from "react"

const OPTIONS = [
  { value: "system", icon: RiComputerLine, label: "System" },
  { value: "light", icon: RiSunLine, label: "Light" },
  { value: "dark", icon: RiMoonLine, label: "Dark" },
] as const

type ThemeValue = (typeof OPTIONS)[number]["value"]

const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div
      role="radiogroup"
      aria-label="Theme selector"
      className={cx(
        "inline-flex items-center gap-0.5 rounded-full p-1",
        "bg-gray-100 dark:bg-gray-800/80",
        "ring-1 ring-gray-200 dark:ring-gray-700/60",
      )}
    >
      {OPTIONS.map(({ value, icon: Icon, label }) => {
        const isActive = theme === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`Switch to ${label} mode`}
            onClick={() => setTheme(value)}
            className={cx(
              "relative flex size-8 min-h-11 min-w-11 items-center justify-center rounded-full outline-none transition-colors duration-150",
              focusRing,
              isActive
                ? "text-gray-900 dark:text-gray-50"
                : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300",
            )}
          >
            {/* Sliding pill */}
            {isActive && (
              <motion.span
                layoutId="theme-pill"
                className="absolute inset-0 rounded-full bg-white shadow-sm ring-1 ring-gray-200/80 dark:bg-gray-700 dark:ring-gray-600/60"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}

            {/* Icon with scale micro-interaction */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={`${value}-${isActive}`}
                className="relative z-10 flex items-center justify-center"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
              >
                <Icon
                  className={cx(
                    "size-4 transition-colors duration-150",
                    isActive
                      ? "text-brand-500 dark:text-brand-400"
                      : "text-inherit",
                  )}
                  aria-hidden="true"
                />
              </motion.span>
            </AnimatePresence>
          </button>
        )
      })}
    </div>
  )
}

export default ThemeSwitch
