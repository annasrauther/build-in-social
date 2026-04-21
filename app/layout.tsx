import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SmoothScroll } from "@/components/providers/SmoothScroll";

/**
 * Typography — IBM Plex Sans + IBM Plex Mono.
 *
 * Plex has the engineered feel Linear's Inter-ish stack aims for but with
 * more character. Weights 400 / 500 carry hierarchy; we keep 600 for rare
 * emphatic labels. Mono carries numerics, IDs, timestamps, and shortcuts.
 *
 * CSS variables:
 *   --font-sans   → IBM Plex Sans  (body, headings, UI)
 *   --font-mono   → IBM Plex Mono  (tabular numerics, kbd, code)
 * Legacy `--font-serif` and `--font-heading` are aliased to `--font-sans`
 * in globals.css so no component-level rename is required.
 */
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Build In Social — weekly platform-native video, end to end",
    template: "%s | Build In Social",
  },
  description:
    "Tell Build In Social what you're building this week. It posts platform-native videos for YouTube Shorts, Instagram Reels, LinkedIn, and X — while you build.",
  keywords: [
    "social media automation",
    "indie developer",
    "SaaS founder",
    "content distribution",
    "video content",
    "pSEO",
  ],
  authors: [{ name: "Build In Social" }],
  creator: "Build In Social",
  metadataBase: new URL("https://buildinsocial.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://buildinsocial.com",
    title: "Build In Social — weekly platform-native video, end to end",
    description:
      "One prompt per week. Platform-native content for 4 platforms. Every video gets a Google-indexed SEO page. Posts while you build.",
    siteName: "Build In Social",
  },
  twitter: {
    card: "summary_large_image",
    title: "Build In Social — weekly platform-native video, end to end",
    description:
      "One prompt per week. Platform-native content for 4 platforms. Posts while you build.",
    creator: "@buildinsocial",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${plexSans.variable} ${plexMono.variable}`}
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <body className="overflow-y-scroll scroll-auto antialiased bg-bg text-text">
        <SmoothScroll />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
