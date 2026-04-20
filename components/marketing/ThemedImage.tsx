"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

// Conditionally renders the light OR dark variant based on the resolved theme
// so we don't double-load ~1MB of hero imagery on landing. Pre-hydration we
// render BOTH variants (dark hidden via CSS) but only the light one keeps
// `priority` / LCP hint, avoiding hydration mismatch while matching the old
// OS-preference behaviour. Once mounted we swap to a single <Image>.
const ThemedImage = ({
  lightSrc,
  darkSrc,
  alt,
  width,
  height,
  className,
}: {
  lightSrc: string
  darkSrc: string
  alt: string
  width: number
  height: number
  className?: string
}) => {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const containerStyle = { aspectRatio: `${width} / ${height}` }
  const sizes =
    "(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1280px"

  // Post-hydration — render only the active variant.
  if (mounted) {
    const isDark = resolvedTheme === "dark"
    return (
      <div className="relative w-full" style={containerStyle}>
        <Image
          src={isDark ? darkSrc : lightSrc}
          alt={isDark ? "" : alt}
          aria-hidden={isDark ? "true" : undefined}
          fill
          sizes={sizes}
          priority
          className={`object-cover ${className ?? ""}`}
        />
      </div>
    )
  }

  // SSR / pre-hydration fallback: render both, CSS toggles visibility, only
  // light gets `priority` so LCP isn't split across two images.
  return (
    <div className="relative w-full" style={containerStyle}>
      <Image
        src={lightSrc}
        alt={alt}
        fill
        sizes={sizes}
        priority
        className={`object-cover dark:hidden ${className ?? ""}`}
      />
      <Image
        src={darkSrc}
        alt=""
        aria-hidden="true"
        fill
        sizes={sizes}
        className={`object-cover hidden dark:block ${className ?? ""}`}
      />
    </div>
  )
}

export default ThemedImage
