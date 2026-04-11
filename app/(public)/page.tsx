import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { SocialProof } from "@/components/landing/SocialProof";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PricingSection } from "@/components/landing/PricingSection";
import { FinalCta } from "@/components/landing/FinalCta";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
  title: "Build In Social — Your content. Every platform. On autopilot.",
  description:
    "Video content for YouTube, Instagram, LinkedIn, and X — created and posted automatically. Start posting today.",
};

export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <Hero />
      <SocialProof />
      <FeaturesGrid />
      <HowItWorks />
      <PricingSection />
      <FinalCta />
      <LandingFooter />
    </>
  );
}
