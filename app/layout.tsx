import type { Metadata } from "next";
import { Poppins, Lora } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Build In Social — Your social media employee is here.",
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
    title: "Build In Social — Your social media employee is here.",
    description:
      "One prompt per week. Platform-native content for 4 platforms. Every video gets a Google-indexed SEO page. Posts while you build.",
    siteName: "Build In Social",
  },
  twitter: {
    card: "summary_large_image",
    title: "Build In Social — Your social media employee is here.",
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
      className={`${poppins.variable} ${lora.variable}`}
      suppressHydrationWarning
    >
      <body className="overflow-y-scroll scroll-auto antialiased selection:bg-brand-100 selection:text-brand-900 dark:selection:bg-brand-900 dark:selection:text-brand-100 bg-[#FAF9F5] dark:bg-[#141413]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
