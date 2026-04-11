/**
 * Real Resend email service using @resend/sdk and React Email templates.
 * Falls back to mock when RESEND_API_KEY is not set.
 */

import { Resend } from "resend";
import * as React from "react";
import {
  WelcomeEmail,
  PlanReadyEmail,
  VideoCompleteEmail,
  VoiceReadyEmail,
  BillingConfirmedEmail,
  RenderFailedEmail,
} from "@/lib/email/templates";
import type { EmailTemplate } from "@/lib/mock/resend.mock";

let _resend: Resend | null = null;
function getClient(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

function from(): string {
  return process.env.RESEND_FROM_EMAIL ?? "hello@buildinsocial.com";
}

type EmailConfig = { subject: string; react: React.ReactElement };

export async function sendEmail(params: {
  to: string;
  template: EmailTemplate;
  data?: Record<string, unknown>;
}): Promise<{ id: string }> {
  const resend = getClient();
  const d = params.data ?? {};

  const configs: Record<EmailTemplate, EmailConfig> = {
    welcome: {
      subject: "Build In Social is ready to post for you.",
      react: React.createElement(WelcomeEmail, {
        displayName: (d.displayName as string) ?? "there",
      }),
    },
    "plan-ready": {
      subject: `Your ${d.videoCount ?? ""} videos are ready to approve.`,
      react: React.createElement(PlanReadyEmail, {
        displayName: (d.displayName as string) ?? "there",
        videoCount: (d.videoCount as number) ?? 0,
        weekId: (d.weekId as string) ?? "",
      }),
    },
    "video-complete": {
      subject: `Ready: ${d.videoTitle ?? "Your video"}`,
      react: React.createElement(VideoCompleteEmail, {
        displayName: (d.displayName as string) ?? "there",
        videoTitle: (d.videoTitle as string) ?? "Untitled",
        videoId: (d.videoId as string) ?? "",
      }),
    },
    "voice-ready": {
      subject: "Your voice clone is ready.",
      react: React.createElement(VoiceReadyEmail, {
        displayName: (d.displayName as string) ?? "there",
      }),
    },
    "billing-confirmed": {
      subject: `You're on the ${d.tier ?? ""} plan.`,
      react: React.createElement(BillingConfirmedEmail, {
        displayName: (d.displayName as string) ?? "there",
        tier: (d.tier as string) ?? "",
      }),
    },
    "render-failed": {
      subject: "Render failed.",
      react: React.createElement(RenderFailedEmail, {
        displayName: (d.displayName as string) ?? "there",
        videoTitle: (d.videoTitle as string) ?? "Untitled",
        videoId: (d.videoId as string) ?? "",
      }),
    },
  };

  const config = configs[params.template];
  const { data, error } = await resend.emails.send({
    from: from(),
    to: params.to,
    subject: config.subject,
    react: config.react,
  });

  if (error) throw new Error(`Resend error: ${error.message}`);
  return { id: data?.id ?? "" };
}
