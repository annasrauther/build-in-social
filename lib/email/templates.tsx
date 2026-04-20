/**
 * React Email templates for Build In Social transactional emails.
 * Poppins (body) / Montserrat (headings), black accent, white-first design.
 */

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

// ─── Shared styles ────────────────────────────────────────────────────────────

const main = { backgroundColor: "#ffffff", fontFamily: "Poppins, system-ui, sans-serif" };
const container = {
  backgroundColor: "#ffffff",
  border: "1px solid rgba(0,0,0,0.10)",
  borderRadius: "12px",
  margin: "40px auto",
  maxWidth: "520px",
  padding: "32px",
};
const brand = { color: "rgb(36, 36, 36)", fontSize: "18px", fontWeight: "700", letterSpacing: "-0.02em" };
const h1 = { color: "#0a0a0a", fontSize: "20px", fontWeight: "700", margin: "20px 0 8px" };
const body = { color: "#52525b", fontSize: "15px", lineHeight: "1.6", margin: "0 0 16px" };
const hr = { borderColor: "rgba(0,0,0,0.06)", margin: "24px 0" };
const footer = { color: "#a1a1aa", fontSize: "12px", margin: "0" };
const btn = {
  backgroundColor: "rgb(36, 36, 36)",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  padding: "12px 24px",
  textDecoration: "none",
};

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://buildinsocial.com";

// ─── Welcome ──────────────────────────────────────────────────────────────────

export function WelcomeEmail({ displayName }: { displayName: string }) {
  return (
    <Html>
      <Head />
      <Preview>Build In Social is ready to post for you.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>Build In Social</Text>
          <Heading style={h1}>Welcome, {displayName}.</Heading>
          <Text style={body}>
            Your social media employee just clocked in. Tell Build In Social what you&apos;re
            building this week — it&apos;ll build platform-native videos for YouTube Shorts,
            Instagram Reels, LinkedIn, and X.
          </Text>
          <Text style={body}>You have 14 days free. No credit card required.</Text>
          <Section style={{ margin: "24px 0" }}>
            <Button href={`${appUrl}/onboarding/hook`} style={btn}>
              Set up your first week →
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            <Link href={appUrl} style={{ color: "#a1a1aa" }}>buildinsocial.com</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// ─── PlanReady ────────────────────────────────────────────────────────────────

export function PlanReadyEmail({ displayName, videoCount, weekId }: { displayName: string; videoCount: number; weekId: string }) {
  return (
    <Html>
      <Head />
      <Preview>Your week&apos;s content plan is ready to approve.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>Build In Social</Text>
          <Heading style={h1}>{videoCount} videos are ready for you.</Heading>
          <Text style={body}>
            Hey {displayName}, Build In Social has built your weekly content plan.
            {videoCount} platform-native videos — one click to approve them all.
          </Text>
          <Section style={{ margin: "24px 0" }}>
            <Button href={`${appUrl}/plan/${weekId}`} style={btn}>
              Review this week →
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            <Link href={appUrl} style={{ color: "#a1a1aa" }}>buildinsocial.com</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// ─── VideoComplete ────────────────────────────────────────────────────────────

export function VideoCompleteEmail({ displayName, videoTitle, videoId }: { displayName: string; videoTitle: string; videoId: string }) {
  return (
    <Html>
      <Head />
      <Preview>Your video is ready: {videoTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>Build In Social</Text>
          <Heading style={h1}>Your video is ready.</Heading>
          <Text style={body}>Hey {displayName}, your render completed.</Text>
          <Text style={{ ...body, color: "#0a0a0a", fontWeight: "600" }}>{videoTitle}</Text>
          <Section style={{ margin: "24px 0" }}>
            <Button href={`${appUrl}/videos/${videoId}`} style={btn}>
              View your video →
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            <Link href={appUrl} style={{ color: "#a1a1aa" }}>buildinsocial.com</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// ─── VoiceReady ───────────────────────────────────────────────────────────────

export function VoiceReadyEmail({ displayName }: { displayName: string }) {
  return (
    <Html>
      <Head />
      <Preview>Your voice clone is ready.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>Build In Social</Text>
          <Heading style={h1}>Your voice is cloned.</Heading>
          <Text style={body}>
            Hey {displayName}, your voice clone has finished processing.
            Every video Build In Social posts will now use your voice.
          </Text>
          <Section style={{ margin: "24px 0" }}>
            <Button href={`${appUrl}/plan/current`} style={btn}>
              Build this week&apos;s content →
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            <Link href={appUrl} style={{ color: "#a1a1aa" }}>buildinsocial.com</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// ─── BillingConfirmed ─────────────────────────────────────────────────────────

export function BillingConfirmedEmail({ displayName, tier }: { displayName: string; tier: string }) {
  return (
    <Html>
      <Head />
      <Preview>You&apos;re on the {tier} plan.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>Build In Social</Text>
          <Heading style={h1}>You&apos;re on {tier}.</Heading>
          <Text style={body}>
            Hey {displayName}, your subscription is confirmed.
            Build In Social is now working for you on the {tier} plan.
          </Text>
          <Section style={{ margin: "24px 0" }}>
            <Button href={`${appUrl}/plan/current`} style={btn}>
              Go to your plan →
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            <Link href={`${appUrl}/settings/billing`} style={{ color: "#a1a1aa" }}>Billing settings</Link>
            {" · "}
            <Link href={appUrl} style={{ color: "#a1a1aa" }}>buildinsocial.com</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// ─── PublishSuccess ───────────────────────────────────────────────────────────

export function PublishSuccessEmail({ displayName, videoTitle, platform, videoId }: { displayName: string; videoTitle: string; platform: string; videoId: string }) {
  return (
    <Html>
      <Head />
      <Preview>Posted: {videoTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>Build In Social</Text>
          <Heading style={h1}>Your video is live on {platform}.</Heading>
          <Text style={body}>Hey {displayName}, Build In Social just published your video to {platform}.</Text>
          <Text style={{ ...body, color: "#0a0a0a", fontWeight: "600" }}>{videoTitle}</Text>
          <Section style={{ margin: "24px 0" }}>
            <Button href={`${appUrl}/videos/${videoId}`} style={btn}>
              View post →
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            <Link href={appUrl} style={{ color: "#a1a1aa" }}>buildinsocial.com</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// ─── QuotaWarning ─────────────────────────────────────────────────────────────

export function QuotaWarningEmail({ displayName, used, cap, tier }: { displayName: string; used: number; cap: number; tier: string }) {
  return (
    <Html>
      <Head />
      <Preview>{`You've used ${used} of ${cap} videos this month.`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>Build In Social</Text>
          <Heading style={h1}>You&apos;re approaching your video limit.</Heading>
          <Text style={body}>
            Hey {displayName}, you&apos;ve used {used} of your {cap} videos this month on the {tier} plan.
            Once you hit the cap, Build In Social pauses new renders until your quota resets.
          </Text>
          <Section style={{ margin: "24px 0" }}>
            <Button href={`${appUrl}/settings/billing`} style={btn}>
              Upgrade for more →
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            <Link href={`${appUrl}/settings/billing`} style={{ color: "#a1a1aa" }}>Billing settings</Link>
            {" · "}
            <Link href={appUrl} style={{ color: "#a1a1aa" }}>buildinsocial.com</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// ─── RenderFailed ─────────────────────────────────────────────────────────────

export function RenderFailedEmail({ displayName, videoTitle, videoId }: { displayName: string; videoTitle: string; videoId: string }) {
  return (
    <Html>
      <Head />
      <Preview>Render failed — we&apos;re looking into it.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>Build In Social</Text>
          <Heading style={h1}>Render failed.</Heading>
          <Text style={body}>Hey {displayName}, we hit a problem rendering your video.</Text>
          <Text style={{ ...body, color: "#0a0a0a", fontWeight: "600" }}>{videoTitle}</Text>
          <Text style={body}>You can retry from your video page. If it keeps failing, reply to this email.</Text>
          <Section style={{ margin: "24px 0" }}>
            <Button href={`${appUrl}/videos/${videoId}`} style={btn}>
              Retry →
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            <Link href={appUrl} style={{ color: "#a1a1aa" }}>buildinsocial.com</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
