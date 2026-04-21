/**
 * Stock-avatar generation pipeline — dry-run planner + emitter.
 *
 * Run:   `pnpm tsx scripts/generate-avatars.ts --dry-run`
 *   or:  `pnpm tsx scripts/generate-avatars.ts --emit` (requires the real
 *        image-generation + thumbnail + R2 upload wiring — see TODO below).
 *
 * What the real pipeline should do:
 *   1. Fan out (vibe × gender × gesture) prompt presets to an image model.
 *      Gestures matter because every avatar has a baked-in pose that fits
 *      its vibe (founder: confident eye contact; creator: expressive hands;
 *      etc.). Dedupe near-identical images by perceptual hash.
 *   2. Quality-filter: resolution ≥ 1024px, face detection confident, no
 *      watermark, no text overlay. Reject on failure.
 *   3. Upload approved images to R2 at /avatars/{id}/{full,thumb}.webp.
 *   4. Update content/avatars.ts with the new metadata rows. Tier gating is
 *      applied after the fact by an internal curator (not the pipeline).
 *
 * This script is the scaffolding for that pipeline. In dry-run mode it just
 * prints the prompt-preset matrix so an operator can estimate throughput and
 * budget before kicking off a real batch. The real upload + emit path is
 * deliberately stubbed so the script can't accidentally mutate production
 * catalog files during a dry-run pass.
 */

import type { AvatarGenderLabel, AvatarVibe } from "@/lib/types/avatar";

// ─── Prompt matrix ──────────────────────────────────────────────────────────

const VIBES: AvatarVibe[] = [
  "founder",
  "host",
  "teacher",
  "reporter",
  "creator",
  "expert",
  "builder",
  "seller",
];

const GENDERS: AvatarGenderLabel[] = ["male", "female", "neutral"];

// One gesture per vibe — the pose that carries the vibe's emotional register.
const GESTURE_FOR_VIBE: Record<AvatarVibe, string> = {
  founder: "confident eye contact, hands loosely clasped at waist",
  host: "mid-sentence expression, one hand lifted in an open gesture",
  teacher: "warm instructive expression, leaning slightly forward",
  reporter: "neutral news-anchor pose, shoulders square",
  creator: "expressive open hands, energetic mid-laugh moment",
  expert: "subtle nod, considered expression, eyes focused",
  builder: "laptop-side pose, relaxed shoulders, thoughtful look",
  seller: "approachable smile, body angled toward camera",
};

const DEMOGRAPHIC_AXES = [
  "age 28-34",
  "age 35-44",
  "age 45-54",
  "east-asian",
  "south-asian",
  "black",
  "white",
  "latino",
  "mixed heritage",
];

interface PromptPreset {
  id: string;
  vibe: AvatarVibe;
  gender: AvatarGenderLabel;
  demographic: string;
  prompt: string;
}

function buildMatrix(): PromptPreset[] {
  const out: PromptPreset[] = [];
  for (const vibe of VIBES) {
    for (const gender of GENDERS) {
      for (const demographic of DEMOGRAPHIC_AXES) {
        out.push({
          id: `${vibe}-${gender}-${demographic.replace(/\s+/g, "_")}`,
          vibe,
          gender,
          demographic,
          prompt:
            `Cinematic upper-body portrait of a ${demographic} ${gender} ` +
            `person, ${GESTURE_FOR_VIBE[vibe]}, soft studio lighting, ` +
            `neutral background, crisp focus on face, realistic skin ` +
            `texture, no watermark, no text. Framed for 9:16 vertical video.`,
        });
      }
    }
  }
  return out;
}

// ─── Dry run ────────────────────────────────────────────────────────────────

function dryRun() {
  const matrix = buildMatrix();
  console.log(`[avatars] prompt matrix: ${matrix.length} presets`);
  console.log(
    `[avatars] vibes=${VIBES.length}, genders=${GENDERS.length}, demographics=${DEMOGRAPHIC_AXES.length}`,
  );
  console.log(`[avatars] sample preset:\n${JSON.stringify(matrix[0], null, 2)}`);
  console.log(
    `[avatars] estimated images at 1 variant per preset: ${matrix.length}. ` +
      `Expect ~20-30% to pass the quality filter.`,
  );
}

// ─── Emit (real pipeline — stubbed) ─────────────────────────────────────────

async function emit() {
  // TODO(avatars): wire to the real image-generation provider, upload to R2,
  // quality-filter, and emit rows into content/avatars.ts. For now this is
  // a guarded stub so the script can't mutate anything by accident.
  console.log(
    "[avatars] emit mode is not yet wired. Implement the R2 upload + " +
      "metadata emitter before flipping this on.",
  );
  // Reference reads so lint doesn't flag the imports as unused when stub mode
  // is the only path that ships.
  void buildMatrix();
}

// ─── CLI ────────────────────────────────────────────────────────────────────

async function main() {
  const mode = process.argv.includes("--emit") ? "emit" : "dry-run";
  if (mode === "emit") {
    await emit();
  } else {
    dryRun();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
