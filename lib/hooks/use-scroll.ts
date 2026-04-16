import { useCallback, useEffect, useState } from "react"

export default function useScroll(threshold: number) {
  // Lazy init reads window.scrollY once at mount without triggering a cascading render.
  const [scrolled, setScrolled] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.scrollY > threshold : false,
  )

  const onScroll = useCallback(() => {
    setScrolled(window.scrollY > threshold)
  }, [threshold])

  useEffect(() => {
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [onScroll])

  return scrolled
}
