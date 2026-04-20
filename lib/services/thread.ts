/**
 * Thread splitting service for X (Twitter) platform.
 *
 * Takes a plain script string and splits it into tweet-sized chunks.
 * Each tweet is hard-capped at 280 characters (including the counter suffix).
 * The counter suffix format is " {n}/{total}" — reserved before splitting.
 *
 * Rules:
 *   - Split on blank-line boundaries first (natural paragraph breaks).
 *   - If a paragraph still exceeds the char budget, split on sentence
 *     boundaries (". ", "! ", "? "), then on word boundaries as last resort.
 *   - Empty chunks are discarded.
 *   - Returns at least one tweet even if the script is empty.
 */

const TWEET_MAX = 280;

/** Split text into paragraphs on one-or-more blank lines */
function toParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter(Boolean);
}

/** Split a long paragraph into chunks ≤ maxLen characters */
function chunkParagraph(para: string, maxLen: number): string[] {
  if (para.length <= maxLen) return [para];

  const chunks: string[] = [];
  let remaining = para;

  while (remaining.length > maxLen) {
    // Try sentence boundaries first
    let cutAt = -1;
    for (const sep of [". ", "! ", "? "]) {
      const idx = remaining.lastIndexOf(sep, maxLen - 1);
      if (idx > 0 && idx + 1 > cutAt) cutAt = idx + 1; // include the punctuation
    }

    if (cutAt <= 0) {
      // Fall back to word boundary
      const spaceIdx = remaining.lastIndexOf(" ", maxLen - 1);
      cutAt = spaceIdx > 0 ? spaceIdx : maxLen;
    }

    chunks.push(remaining.slice(0, cutAt).trim());
    remaining = remaining.slice(cutAt).trim();
  }

  if (remaining.length > 0) chunks.push(remaining);
  return chunks;
}

/**
 * Split a script string into an array of tweet objects for X thread display.
 *
 * @param script - The raw script text (hook + body + cta joined or just body).
 * @returns Array of `{ index, text }` where `text` includes the counter suffix.
 */
export function splitScriptIntoThread(
  script: string
): Array<{ index: number; text: string }> {
  const normalized = script.trim();
  if (!normalized) {
    return [{ index: 1, text: "1/1" }];
  }

  const paragraphs = toParagraphs(normalized);

  // First pass: collect raw chunks without knowing total count yet.
  // Use a conservative budget (assume double-digit total = 6 chars " 99/99").
  const CONSERVATIVE_SUFFIX = 6;
  const rawChunks: string[] = [];

  for (const para of paragraphs) {
    const chunks = chunkParagraph(para, TWEET_MAX - CONSERVATIVE_SUFFIX);
    rawChunks.push(...chunks);
  }

  const total = rawChunks.length;

  // Second pass: apply precise budgets now that we know total, and truncate if needed.
  return rawChunks.map((chunk, i) => {
    const idx = i + 1;
    const suffix = ` ${idx}/${total}`;
    const maxBody = TWEET_MAX - suffix.length;
    const body = chunk.length > maxBody ? chunk.slice(0, maxBody - 1) + "…" : chunk;
    return { index: idx, text: body + suffix };
  });
}
