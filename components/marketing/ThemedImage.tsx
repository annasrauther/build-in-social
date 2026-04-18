import Image from "next/image"

// Both <Image> variants are rendered into the same fixed-aspect container and
// absolutely stacked on top of each other. CSS media queries (not JS/setState)
// control which one is visible, matching the original OS-preference behaviour.
// Using next/image gives us automatic WebP/AVIF conversion, responsive srcset,
// and no layout shift — the container reserves space via aspect-ratio before
// either image loads.
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
  return (
    // The container fixes the aspect ratio so no layout shift occurs regardless
    // of which image variant the browser selects.
    <div
      className="relative w-full"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {/* Light variant — hidden when OS prefers dark */}
      <Image
        src={lightSrc}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1280px"
        priority
        className={`object-cover dark:hidden ${className ?? ""}`}
      />
      {/* Dark variant — hidden when OS prefers light */}
      <Image
        src={darkSrc}
        alt=""
        aria-hidden="true"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1280px"
        priority
        className={`object-cover hidden dark:block ${className ?? ""}`}
      />
    </div>
  )
}

export default ThemedImage
