/**
 * Claude API service — uses real Anthropic SDK when ANTHROPIC_API_KEY is set,
 * falls back to mock for local development without a key.
 */

import * as mock from "@/lib/mock/claude.mock";
import * as real from "@/lib/services/claude.real";

const useReal = !!process.env.ANTHROPIC_API_KEY;

export const checkQualityGate: typeof real.checkQualityGate = useReal
  ? real.checkQualityGate
  : mock.checkQualityGate;

export const generateAutopilotAngles: typeof real.generateAutopilotAngles = useReal
  ? real.generateAutopilotAngles
  : mock.generateAutopilotAngles;

export const generateWeeklyPlan: typeof real.generateWeeklyPlan = useReal
  ? real.generateWeeklyPlan
  : mock.generateWeeklyPlan;

export const generateScript: typeof real.generateScript = useReal
  ? real.generateScript
  : mock.generateScript;

export const generatePseoPage: typeof real.generatePseoPage = useReal
  ? real.generatePseoPage
  : mock.generatePseoPage;

export const generateHookVariants: typeof real.generateHookVariants = useReal
  ? real.generateHookVariants
  : mock.generateHookVariants;

export const generateSeriesPlan: typeof real.generateSeriesPlan = useReal
  ? real.generateSeriesPlan
  : mock.generateSeriesPlan;

export const labelVideo: typeof real.labelVideo = useReal
  ? real.labelVideo
  : (mock.labelVideo as unknown as typeof real.labelVideo);

export const reviseScript: typeof real.reviseScript = useReal
  ? real.reviseScript
  : mock.reviseScript;
