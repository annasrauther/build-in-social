import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Providers } from "@/components/providers";

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
      className={`dark ${GeistSans.variable} ${GeistMono.variable}`}
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <body className="overflow-y-scroll scroll-auto antialiased bg-bg text-text">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
