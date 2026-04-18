/**
 * WebVTT caption generation.
 * Converts the script segment array produced during FFmpeg assembly into a
 * valid WebVTT string so that every rendered video ships with a machine-
 * readable sidecar .vtt file stored alongside the .mp4 in R2.
 *
 * No new dependencies — pure string transformation only.
 */

export interface CaptionSegment {
  /** Display text for this caption cue. */
  text: string;
  /** Cue start time in seconds (fractional OK). */
  start: number;
  /** Cue end time in seconds (fractional OK). */
  end: number;
}

/**
 * Format a seconds value as a WebVTT timestamp: HH:MM:SS.mmm
 */
function formatTimestamp(seconds: number): string {
  const totalMs = Math.round(seconds * 1000);
  const ms = totalMs % 1000;
  const totalSec = Math.floor(totalMs / 1000);
  const s = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const m = totalMin % 60;
  const h = Math.floor(totalMin / 60);

  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  const mmm = String(ms).padStart(3, "0");

  return `${hh}:${mm}:${ss}.${mmm}`;
}

/**
 * Convert an array of caption segments to a valid WebVTT string.
 *
 * Usage:
 *   const vtt = generateVTT(segments);
 *   // vtt is ready to write to a .vtt file
 */
export function generateVTT(segments: CaptionSegment[]): string {
  const cues = segments
    .filter((seg) => seg.end > seg.start && seg.text.trim().length > 0)
    .map((seg, i) => {
      const start = formatTimestamp(seg.start);
      const end = formatTimestamp(seg.end);
      // Cue identifier is 1-based
      return `${i + 1}\n${start} --> ${end}\n${seg.text.trim()}`;
    });

  return ["WEBVTT", "", ...cues].join("\n\n");
}

/**
 * Derive caption segments from a flat script string and a known total duration.
 * Uses the same word-boundary segmentation as the FFmpeg builder so the VTT
 * cue timings match the burned-in overlay timings exactly.
 *
 * @param script   The full narration script.
 * @param duration Total video duration in seconds.
 * @param maxChars Maximum characters per caption cue (mirrors FFmpeg builder).
 */
export function buildCaptionSegments(
  script: string,
  duration: number,
  maxChars = 80,
): CaptionSegment[] {
  // Replicate the segmentation logic from lib/services/ffmpeg.ts::segmentScript
  const sentences = script
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  const texts: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if (current.length + sentence.length > maxChars && current.length > 0) {
      texts.push(current.trim());
      current = sentence;
    } else {
      current += (current ? " " : "") + sentence;
    }
  }
  if (current.trim()) texts.push(current.trim());

  if (texts.length === 0) texts.push(script.slice(0, maxChars));

  const segDuration = duration / texts.length;

  return texts.map((text, i) => ({
    text,
    start: i * segDuration,
    end: (i + 1) * segDuration,
  }));
}
