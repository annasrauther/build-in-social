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
  // <picture> lets the browser pick exactly one source based on the user's
  // OS color scheme preference — only the chosen image is fetched, and no
  // hydration/setState dance is needed. If the user later toggles theme via
  // next-themes, the image stays tied to the OS preference (acceptable for a
  // marketing hero — matches the initial paint for 95%+ of visitors).
  return (
    <picture>
      <source srcSet={darkSrc} media="(prefers-color-scheme: dark)" />
      <img
        src={lightSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        fetchPriority="high"
      />
    </picture>
  )
}

export default ThemedImage
