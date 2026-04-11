/**
 * Resend email service — uses real Resend SDK when RESEND_API_KEY is set,
 * falls back to mock (console.log) for local development without a key.
 */

import * as mock from "@/lib/mock/resend.mock";
import * as real from "@/lib/services/resend.real";

const useReal = !!process.env.RESEND_API_KEY;

export type { EmailTemplate } from "@/lib/mock/resend.mock";

export const sendEmail: typeof real.sendEmail = useReal
  ? real.sendEmail
  : mock.sendEmail;
