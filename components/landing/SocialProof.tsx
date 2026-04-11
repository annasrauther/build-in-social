import { Container } from "@/components/ui/Container";
import { LANDING } from "@/content/landing";

export function SocialProof() {
  const { metrics } = LANDING.SOCIAL_PROOF;

  return (
    <section
      className="py-8 tablet-sm:py-10"
      style={{ backgroundColor: "var(--bg-elevated)" }}
    >
      <Container size="wide">
        <div className="flex flex-wrap justify-center gap-8 tablet-sm:gap-16">
          {metrics.map((metric, i) => (
            <div key={metric.label} className="flex items-center gap-8 tablet-sm:gap-16">
              {/* Metric */}
              <div className="text-center">
                <p
                  className="font-semibold"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 24,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {metric.value}
                </p>
                <p
                  className="font-medium uppercase mt-1"
                  style={{
                    fontSize: "var(--type-micro)",
                    color: "var(--text-tertiary)",
                    letterSpacing: "0.07em",
                  }}
                >
                  {metric.label}
                </p>
              </div>

              {/* Vertical divider — after all except last */}
              {i < metrics.length - 1 && (
                <div
                  className="hidden tablet-sm:block"
                  style={{
                    width: 1,
                    height: 32,
                    backgroundColor: "var(--border-default)",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
