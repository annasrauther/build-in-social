import type { Metadata } from "next";
import { LandingNav } from "@/components/landing-old/LandingNav";
import { LandingHero } from "@/components/landing-old/LandingHero";
import { ValueProps } from "@/components/landing-old/ValueProps";
import { HowItWorks } from "@/components/landing-old/HowItWorks";
import { Testimonials } from "@/components/landing-old/Testimonials";
import { PricingSection } from "@/components/landing-old/PricingSection";
import { FinalCta } from "@/components/landing-old/FinalCta";
import { LandingFooter } from "@/components/landing-old/LandingFooter";

export const metadata: Metadata = {
  title: "Build In Social — Your presence, on every platform. (Classic)",
  description:
    "23 platform-native videos a week across YouTube, Instagram, LinkedIn, and X. No filming. No scripting. No posting.",
};

export default function OldLandingPage() {
  return (
    <div className="landing-page">
      <LandingNav />
      <hr className="lp-divider" />
      <LandingHero />
      <hr className="lp-divider" />
      <ValueProps />
      <hr className="lp-divider" />
      <HowItWorks />
      <hr className="lp-divider" />
      <Testimonials />
      <hr className="lp-divider" />
      <PricingSection />
      <hr className="lp-divider" />
      <FinalCta />
      <LandingFooter />
    </div>
  );
}
