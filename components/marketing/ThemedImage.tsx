"use client"

import Image from "next/image"

/**
 * Dark-only — always renders the dark variant.
 *
 * Retained as a component so callers (which pass light + dark variants)
 * keep working. `lightSrc` is accepted for API compatibility and ignored.
 * Will be renamed / simplified when marketing migrates in Phase 5.
 */
const ThemedImage = ({
  lightSrc: _lightSrc,
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
  const containerStyle = { aspectRatio: `${width} / ${height}` }
  const sizes =
    "(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1280px"

  return (
    <div className="relative w-full" style={containerStyle}>
      <Image
        src={darkSrc}
        alt={alt}
        fill
        sizes={sizes}
        priority
        className={`object-cover ${className ?? ""}`}
      />
    </div>
  )
}

export default ThemedImage
