"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { LANDING } from "@/content/landing";
import { ease } from "@/lib/motion";

const e = [...ease] as [number, number, number, number];

export function FeaturesGrid() {
  const { headline, features } = LANDING.FEATURES;

  return (
    <section className="py-16 tablet-sm:py-24 desktop-sm:py-32">
      <Container size="wide">
        {/* Heading */}
        <h2
          className="text-center mb-12 tablet-sm:mb-16"
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 400,
            fontSize: "clamp(28px, 4vw, 40px)",
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
          }}
        >
          {headline}
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-1 tablet-sm:grid-cols-2 desktop-sm:grid-cols-3 gap-4 tablet-sm:gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.28, ease: e, delay: i * 0.05 }}
            >
              <Card>
                <CardContent>
                  {feature.image && (
                    <div className="mb-4">
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        width={60}
                        height={60}
                        className="mix-blend-multiply"
                      />
                    </div>
                  )}
                  <h3
                    className="font-semibold mb-2"
                    style={{
                      fontSize: "var(--type-section-mobile)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "var(--type-supporting-mobile)",
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                    }}
                  >
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
