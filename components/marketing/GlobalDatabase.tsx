"use client"
import createGlobe from "cobe"
import { FunctionComponent, useEffect, useRef } from "react"
import { useReducedMotion } from "motion/react"

/* ── Brand logo SVGs ─────────────────────────────────────────────────────── */

function YouTubeLogo() {
  return (
    <svg height="42" viewBox="0 0 90 63" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="YouTube">
      <path
        d="M88.1 9.9C87.1 6.2 84.2 3.3 80.5 2.3 73.5.3 45 .3 45 .3S16.5.3 9.5 2.3C5.8 3.3 2.9 6.2 1.9 9.9 0 16.9 0 31.5 0 31.5s0 14.6 1.9 21.6C2.9 56.8 5.8 59.7 9.5 60.7 16.5 62.7 45 62.7 45 62.7s28.5 0 35.5-2C84.2 59.7 87.1 56.8 88.1 53.1 90 46.1 90 31.5 90 31.5s0-14.6-1.9-21.6z"
        fill="#FF0000"
      />
      <path d="M36 44.5L59.5 31.5 36 18.5v26z" fill="white" />
    </svg>
  )
}

function InstagramLogo() {
  return (
    <svg height="46" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Instagram">
      <defs>
        <radialGradient id="ig-rg" cx="30%" cy="107%" r="130%">
          <stop offset="0%" stopColor="#ffd600" />
          <stop offset="50%" stopColor="#ff0069" />
          <stop offset="100%" stopColor="#d300c5" />
        </radialGradient>
      </defs>
      <rect width="56" height="56" rx="13" fill="url(#ig-rg)" />
      <rect x="4" y="4" width="48" height="48" rx="10" stroke="rgba(255,255,255,0.12)" strokeWidth="1" fill="none" />
      <circle cx="28" cy="28" r="9.5" stroke="white" strokeWidth="3.5" fill="none" />
      <circle cx="40.5" cy="15.5" r="2.5" fill="white" />
    </svg>
  )
}

function LinkedInLogo() {
  return (
    <svg height="46" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="LinkedIn">
      <rect width="72" height="72" rx="8" fill="#0A66C2" />
      <path
        d="M14 28h10v33H14V28zm5-4.5a5.8 5.8 0 110-11.6 5.8 5.8 0 010 11.6zM30 28h9.7v4.5h.1c1.4-2.5 4.7-5.1 9.6-5.1 10.3 0 12.2 6.8 12.2 15.6v18h-10V45c0-3.8-.1-8.7-5.3-8.7-5.3 0-6.1 4.1-6.1 8.4v16.3H30V28z"
        fill="white"
      />
    </svg>
  )
}

function XLogo() {
  return (
    <svg height="38" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="X (Twitter)">
      <path
        d="M178.57 127.15L290.27 0H263.81L166.78 110.38 89.34 0H0l117.13 166.93L0 300.25h26.46l102.4-116.59 81.8 116.59H300L178.57 127.15zM35.02 19.54h40.51l189.94 262.13h-40.51L35.02 19.54z"
        fill="white"
      />
    </svg>
  )
}

/* ── Algo art background ─────────────────────────────────────────────────── */

function AlgoArt() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1400 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <pattern id="algo-dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="1.2" fill="rgba(255,255,255,0.14)" />
        </pattern>
        <radialGradient id="center-fade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.8)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>
      <rect width="1400" height="800" fill="url(#algo-dots)" />

      {/* YouTube — top-left */}
      <polyline points="130,110 130,390 630,390" stroke="#FF0000" strokeWidth="1" fill="none" strokeDasharray="5 9" opacity="0.3" />
      <circle cx="130" cy="110" r="3.5" fill="#FF0000" opacity="0.7" />
      <circle cx="130" cy="110" r="14" stroke="#FF0000" strokeWidth="1" fill="none" opacity="0.15" />

      {/* Instagram — top-right */}
      <polyline points="1270,110 1270,390 770,390" stroke="#E1306C" strokeWidth="1" fill="none" strokeDasharray="5 9" opacity="0.3" />
      <circle cx="1270" cy="110" r="3.5" fill="#E1306C" opacity="0.7" />
      <circle cx="1270" cy="110" r="14" stroke="#E1306C" strokeWidth="1" fill="none" opacity="0.15" />

      {/* LinkedIn — bottom-left */}
      <polyline points="130,690 130,410 630,410" stroke="#0A66C2" strokeWidth="1" fill="none" strokeDasharray="5 9" opacity="0.3" />
      <circle cx="130" cy="690" r="3.5" fill="#0A66C2" opacity="0.7" />
      <circle cx="130" cy="690" r="14" stroke="#0A66C2" strokeWidth="1" fill="none" opacity="0.15" />

      {/* X — bottom-right */}
      <polyline points="1270,690 1270,410 770,410" stroke="rgba(255,255,255,0.55)" strokeWidth="1" fill="none" strokeDasharray="5 9" opacity="0.3" />
      <circle cx="1270" cy="690" r="3.5" fill="rgba(255,255,255,0.6)" opacity="0.7" />
      <circle cx="1270" cy="690" r="14" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none" opacity="0.15" />

      {/* Center hub */}
      <circle cx="700" cy="400" r="4" fill="rgba(217,119,87,0.9)" />
      <circle cx="700" cy="400" r="18" stroke="rgba(217,119,87,0.22)" strokeWidth="1" fill="none" />
      <circle cx="700" cy="400" r="48" stroke="rgba(217,119,87,0.10)" strokeWidth="1" fill="none" />

      {/* Corner accent lines */}
      <line x1="0" y1="0" x2="280" y2="180" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      <line x1="1400" y1="0" x2="1120" y2="180" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      <line x1="0" y1="800" x2="280" y2="620" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      <line x1="1400" y1="800" x2="1120" y2="620" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

      {/* Edge grid lines */}
      <line x1="0" y1="200" x2="280" y2="200" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <line x1="1120" y1="200" x2="1400" y2="200" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <line x1="0" y1="600" x2="280" y2="600" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <line x1="1120" y1="600" x2="1400" y2="600" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

      <circle cx="700" cy="400" r="300" fill="url(#center-fade)" />
    </svg>
  )
}

/* ── Platform logo glows ─────────────────────────────────────────────────── */

const PLATFORM_LOGOS = [
  { component: YouTubeLogo, glow: "rgba(255,0,0,0.35)" },
  { component: InstagramLogo, glow: "rgba(225,48,108,0.35)" },
  { component: LinkedInLogo, glow: "rgba(10,102,194,0.35)" },
  { component: XLogo, glow: "rgba(255,255,255,0.2)" },
]

/* ── Component ───────────────────────────────────────────────────────────── */

export const GlobalDatabase: FunctionComponent = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return
    let phi = 4.7
    const globe = createGlobe(canvasRef.current!, {
      devicePixelRatio: 2,
      width: 520 * 2,
      height: 520 * 2,
      phi: 0,
      theta: -0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 25000,
      mapBrightness: 13,
      mapBaseBrightness: 0.05,
      baseColor: [0.3, 0.3, 0.3],
      glowColor: [0.15, 0.15, 0.15],
      markerColor: [100, 100, 100],
      markers: [],
      onRender: (state: { phi?: number }) => {
        state.phi = phi
        phi += 0.0002
      },
    })
    return () => { globe.destroy() }
  }, [reducedMotion])

  const features = [
    {
      name: "Native to each platform",
      description: "30s Shorts, 20s Reels, 60s LinkedIn, 15s X. Each video matches the duration, hook style, and pacing that platform rewards.",
    },
    {
      name: "SEO that compounds",
      description: "Every video builds a Google-indexed landing page. Your long-tail search presence compounds while you sleep.",
    },
    {
      name: "Your voice, your niche",
      description: "Three-minute setup. Build In Social learns your niche, your audience, and how you talk. Clone your voice from a 60-second recording.",
    },
  ]

  return (
    <section
      aria-labelledby="global-database-title"
      className="relative w-full mt-28 md:mt-40 flex flex-col items-center justify-center overflow-hidden bg-gray-950"
    >
      {/* Algo art background */}
      <div className="absolute inset-0 pointer-events-none">
        <AlgoArt />
      </div>

      {/* Ambient glow */}
      <div className="absolute top-[20rem] size-[32rem] rounded-full bg-brand-900/50 blur-3xl md:top-[22rem] pointer-events-none" />

      {/* ── Text content ── */}
      <div className="relative z-30 flex flex-col items-center text-center px-6 pt-24 pb-0 md:pt-32 w-full max-w-5xl mx-auto">
        {/* Eyebrow badge */}
        <div className="inline-block rounded-full border border-brand-400/20 bg-brand-800/20 px-4 py-1.5 font-semibold uppercase text-xs tracking-widest mb-8">
          <span className="bg-gradient-to-b from-brand-200 to-brand-400 bg-clip-text text-transparent">
            Built for each algorithm
          </span>
        </div>

        {/* Headline */}
        <h2
          id="global-database-title"
          className="inline-block bg-gradient-to-b from-white via-white to-brand-200 bg-clip-text text-transparent text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.05] max-w-4xl"
        >
          One niche.{" "}
          <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
            Four platforms.
          </span>
          <br />
          Zero extra work.
        </h2>

        {/* Platform logos — flat on dark, no containers */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mt-10 sm:mt-12">
          {PLATFORM_LOGOS.map(({ component: Logo, glow }, i) => (
            <div
              key={i}
              style={{ filter: `drop-shadow(0 0 14px ${glow})` }}
            >
              <Logo />
            </div>
          ))}
        </div>
      </div>

      {/* ── Globe ── */}
      <div className="relative z-10 w-full flex justify-center mt-6">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Global platform activity map"
          className="relative h-[520px] w-[520px] max-w-full"
        />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-gray-950 pointer-events-none" />
      </div>

      {/* ── Feature cards ── */}
      <div className="relative z-20 w-full bg-gray-950 px-4 sm:px-6 pb-16 sm:pb-20 pt-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 rounded-2xl border border-white/[4%] bg-white/[2%] px-5 py-7 sm:px-6 sm:py-8 shadow-xl backdrop-blur-sm md:grid-cols-3 md:p-10">
            {features.map((item) => (
              <div key={item.name} className="flex flex-col gap-3">
                <h3 className="text-base font-semibold text-gray-50 md:text-lg font-serif">
                  {item.name}
                </h3>
                <p className="text-sm leading-relaxed text-white/40">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
