/**
 * FFmpeg WASM video assembly service.
 * Uses mock-first approach: when FFMPEG_ENABLED !== 'true', returns a small
 * placeholder Blob. When enabled, uses @ffmpeg/ffmpeg for real assembly.
 *
 * Runs server-side (Node) only — never imported in browser bundles.
 */

export type FacelessStyle = "dev-log" | "documentary" | "minimal-text" | "slide";

export interface AssembleParams {
  style: FacelessStyle;
  audioUrl: string;        // ElevenLabs TTS output (data URI or https URL)
  brollUrls: string[];     // Pexels video URLs
  script: string;          // for text overlays
  durationSeconds: number; // target duration
  platform: "youtube" | "instagram" | "linkedin" | "x";
}

export interface AssembleResult {
  videoBlob: Blob;
  durationSeconds: number;
}

// ─── Platform video specs ────────────────────────────────────────────────────

const PLATFORM_RES: Record<string, { w: number; h: number }> = {
  youtube: { w: 1080, h: 1920 },
  instagram: { w: 1080, h: 1920 },
  linkedin: { w: 1080, h: 1920 },
  x: { w: 1080, h: 1920 },
};

// ─── Text segmentation ──────────────────────────────────────────────────────

function segmentScript(script: string, maxCharsPerSlide: number = 80): string[] {
  const sentences = script
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  const segments: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if (current.length + sentence.length > maxCharsPerSlide && current.length > 0) {
      segments.push(current.trim());
      current = sentence;
    } else {
      current += (current ? " " : "") + sentence;
    }
  }
  if (current.trim()) segments.push(current.trim());

  return segments.length > 0 ? segments : [script.slice(0, maxCharsPerSlide)];
}

// ─── Drawtext escaping ───────────────────────────────────────────────────────

function escapeDrawtext(text: string): string {
  return text
    .replace(/\\/g, "\\\\\\\\")
    .replace(/'/g, "'\\\\\\''")
    .replace(/:/g, "\\\\:")
    .replace(/\[/g, "\\\\[")
    .replace(/\]/g, "\\\\]")
    .replace(/%/g, "%%");
}

// ─── Mock ────────────────────────────────────────────────────────────────────

function mockAssemble(params: AssembleParams): AssembleResult {
  console.log("[MOCK ffmpeg] assembleVideo", params.style, params.platform, `${params.durationSeconds}s`);
  const placeholder = new Blob(["MOCK_VIDEO"], { type: "video/mp4" });
  return { videoBlob: placeholder, durationSeconds: params.durationSeconds };
}

// ─── Real assembly ───────────────────────────────────────────────────────────

async function realAssemble(params: AssembleParams): Promise<AssembleResult> {
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const { fetchFile, toBlobURL } = await import("@ffmpeg/util");

  const ff = new FFmpeg();

  // Load FFmpeg WASM core from CDN
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
  await ff.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  const res = PLATFORM_RES[params.platform] ?? PLATFORM_RES.youtube;

  try {
    // Write audio to virtual FS
    const audioData = await fetchFile(params.audioUrl);
    await ff.writeFile("audio.mp3", audioData);

    // Route to style-specific builder
    switch (params.style) {
      case "minimal-text":
        await buildMinimalText(ff, params, res);
        break;
      case "dev-log":
        await buildDevLog(ff, params, res);
        break;
      case "documentary":
        await buildDocumentary(ff, params, res);
        break;
      case "slide":
        await buildSlide(ff, params, res);
        break;
      default:
        await buildMinimalText(ff, params, res);
    }

    // Read output
    const outputData = await ff.readFile("output.mp4");
    const videoBlob = new Blob([outputData as BlobPart], { type: "video/mp4" });

    return { videoBlob, durationSeconds: params.durationSeconds };
  } finally {
    ff.terminate();
  }
}

// ─── Minimal Text style ──────────────────────────────────────────────────────
// Solid dark/light background, large text cards timed to audio, voiceover.

async function buildMinimalText(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ff: any,
  params: AssembleParams,
  res: { w: number; h: number },
) {
  const segments = segmentScript(params.script);
  const segDuration = params.durationSeconds / segments.length;

  // Build drawtext filter chain — each segment fades in/out at its timeslot
  const textFilters = segments.map((seg, i) => {
    const start = i * segDuration;
    const end = start + segDuration;
    const fadeIn = start;
    const fadeOut = end - 0.3;
    const escaped = escapeDrawtext(seg);
    const fontSize = Math.min(64, Math.floor(res.w / (seg.length / 3 + 2)));

    return `drawtext=text='${escaped}':fontsize=${fontSize}:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,${fadeIn.toFixed(2)},${fadeOut.toFixed(2)})'`;
  });

  const filterComplex = [
    `color=c=0x1a1a1a:s=${res.w}x${res.h}:d=${params.durationSeconds}[bg]`,
    `[bg]${textFilters.join(",")}[v]`,
  ].join(";");

  await ff.exec([
    "-f", "lavfi", "-i", `color=c=0x1a1a1a:s=${res.w}x${res.h}:d=${params.durationSeconds}:r=30`,
    "-i", "audio.mp3",
    "-filter_complex", filterComplex,
    "-map", "[v]",
    "-map", "1:a",
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-crf", "28",
    "-c:a", "aac",
    "-b:a", "128k",
    "-shortest",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    "output.mp4",
  ]);
}

// ─── Dev Log style ───────────────────────────────────────────────────────────
// Terminal/code-like aesthetic: dark bg, monospace text overlays, green accent.

async function buildDevLog(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ff: any,
  params: AssembleParams,
  res: { w: number; h: number },
) {
  const segments = segmentScript(params.script, 100);
  const segDuration = params.durationSeconds / segments.length;

  // Terminal-style text (green on black, monospace look)
  const textFilters = segments.map((seg, i) => {
    const start = i * segDuration;
    const end = start + segDuration;
    const escaped = escapeDrawtext(`> ${seg}`);
    const fontSize = Math.min(40, Math.floor(res.w / 28));

    return `drawtext=text='${escaped}':fontsize=${fontSize}:fontcolor=0x00ff88:x=60:y=(h/2)-text_h/2:enable='between(t,${start.toFixed(2)},${end.toFixed(2)})'`;
  });

  const filterComplex = [
    `color=c=0x0a0a0a:s=${res.w}x${res.h}:d=${params.durationSeconds}[bg]`,
    `[bg]${textFilters.join(",")}[v]`,
  ].join(";");

  await ff.exec([
    "-f", "lavfi", "-i", `color=c=0x0a0a0a:s=${res.w}x${res.h}:d=${params.durationSeconds}:r=30`,
    "-i", "audio.mp3",
    "-filter_complex", filterComplex,
    "-map", "[v]",
    "-map", "1:a",
    "-c:v", "libx264", "-preset", "ultrafast", "-crf", "28",
    "-c:a", "aac", "-b:a", "128k",
    "-shortest", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    "output.mp4",
  ]);
}

// ─── Documentary style ───────────────────────────────────────────────────────
// B-roll footage with text caption overlay + audio narration.

async function buildDocumentary(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ff: any,
  params: AssembleParams,
  res: { w: number; h: number },
) {
  const { fetchFile } = await import("@ffmpeg/util");

  // Download b-roll clips to virtual FS
  const brollInputs: string[] = [];
  for (let i = 0; i < Math.min(params.brollUrls.length, 3); i++) {
    try {
      const data = await fetchFile(params.brollUrls[i]);
      const filename = `broll_${i}.mp4`;
      await ff.writeFile(filename, data);
      brollInputs.push(filename);
    } catch {
      console.warn(`[ffmpeg] Failed to fetch b-roll ${i}, skipping`);
    }
  }

  // If no b-roll fetched, fall back to minimal-text
  if (brollInputs.length === 0) {
    return buildMinimalText(ff, params, res);
  }

  const segments = segmentScript(params.script, 60);
  const segDuration = params.durationSeconds / segments.length;

  // Build caption overlay
  const captionFilters = segments.map((seg, i) => {
    const start = i * segDuration;
    const end = start + segDuration;
    const escaped = escapeDrawtext(seg);
    const fontSize = 36;

    return `drawtext=text='${escaped}':fontsize=${fontSize}:fontcolor=white:borderw=2:bordercolor=black:x=(w-text_w)/2:y=h-160:enable='between(t,${start.toFixed(2)},${end.toFixed(2)})'`;
  });

  // Concatenate b-roll clips, loop to fill duration, scale to target resolution
  const inputArgs: string[] = [];
  brollInputs.forEach((f) => {
    inputArgs.push("-i", f);
  });
  inputArgs.push("-i", "audio.mp3");

  const audioIndex = brollInputs.length;
  const concatFilter = brollInputs
    .map((_, i) => `[${i}:v]scale=${res.w}:${res.h}:force_original_aspect_ratio=decrease,pad=${res.w}:${res.h}:(ow-iw)/2:(oh-ih)/2,setsar=1[v${i}]`)
    .join(";");

  const concatInputs = brollInputs.map((_, i) => `[v${i}]`).join("");
  const fullFilter = [
    concatFilter,
    `${concatInputs}concat=n=${brollInputs.length}:v=1:a=0[raw]`,
    `[raw]loop=loop=-1:size=900:start=0,trim=duration=${params.durationSeconds},setpts=PTS-STARTPTS,${captionFilters.join(",")}[v]`,
  ].join(";");

  await ff.exec([
    ...inputArgs,
    "-filter_complex", fullFilter,
    "-map", "[v]",
    "-map", `${audioIndex}:a`,
    "-c:v", "libx264", "-preset", "ultrafast", "-crf", "28",
    "-c:a", "aac", "-b:a", "128k",
    "-shortest", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    "output.mp4",
  ]);
}

// ─── Slide style ─────────────────────────────────────────────────────────────
// Presentation slide frames — solid bg with centered text blocks, audio.

async function buildSlide(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ff: any,
  params: AssembleParams,
  res: { w: number; h: number },
) {
  const segments = segmentScript(params.script, 60);
  const segDuration = params.durationSeconds / segments.length;

  // Alternating background colors for slide variety
  const bgColors = ["0xffffff", "0xf5f5f5", "0x1a1a1a", "0xf0f0f0"];
  const textColors = ["0x242424", "0x242424", "0xffffff", "0x242424"];

  const textFilters = segments.map((seg, i) => {
    const start = i * segDuration;
    const end = start + segDuration;
    const escaped = escapeDrawtext(seg);
    const fontSize = Math.min(52, Math.floor(res.w / (seg.length / 4 + 2)));
    const fg = textColors[i % textColors.length];

    return `drawtext=text='${escaped}':fontsize=${fontSize}:fontcolor=${fg}:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,${start.toFixed(2)},${end.toFixed(2)})'`;
  });

  // First segment determines initial bg color
  const filterComplex = [
    `color=c=${bgColors[0]}:s=${res.w}x${res.h}:d=${params.durationSeconds}[bg]`,
    `[bg]${textFilters.join(",")}[v]`,
  ].join(";");

  await ff.exec([
    "-f", "lavfi", "-i", `color=c=${bgColors[0]}:s=${res.w}x${res.h}:d=${params.durationSeconds}:r=30`,
    "-i", "audio.mp3",
    "-filter_complex", filterComplex,
    "-map", "[v]",
    "-map", "1:a",
    "-c:v", "libx264", "-preset", "ultrafast", "-crf", "28",
    "-c:a", "aac", "-b:a", "128k",
    "-shortest", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    "output.mp4",
  ]);
}

// ─── Public entry point ──────────────────────────────────────────────────────

export async function assembleVideo(params: AssembleParams): Promise<AssembleResult> {
  if (process.env.FFMPEG_ENABLED !== "true") {
    return mockAssemble(params);
  }
  return realAssemble(params);
}
