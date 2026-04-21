/**
 * Database service — NoCodeBackend via MCP API
 * Instance: 55194_buildinsocial
 *
 * Auth strategy: Build In Social uses Clerk for user auth (Sprint 9); NCB is used as
 * a raw SQL database. All server-side DB calls go through the NCB MCP API endpoint.
 * User isolation is enforced via clerk_user_id filters in every query.
 */

import type { User, VoiceProfile } from "@/lib/types/user";
import type { Video, RenderJob, ContentWeek } from "@/lib/types/video";
import type { PseoPage } from "@/lib/types/pseo";
import type {
  Series,
  CreateSeriesInput,
  SeriesMode,
  SeriesStatus,
  HeygenAvatarSource,
  PostingFrequency,
} from "@/lib/types/series";
import { NCB_INSTANCE as ENV_NCB_INSTANCE, NOCODEBACKEND_SECRET_KEY } from "@/lib/env";

// ─── Config ───────────────────────────────────────────────────────────────────

const NCB_MCP_URL = "https://app.nocodebackend.com/api/mcp";
const NCB_INSTANCE = ENV_NCB_INSTANCE ?? "55194_buildinsocial";
const NCB_TOKEN = NOCODEBACKEND_SECRET_KEY!;

// ─── Core SQL helpers ─────────────────────────────────────────────────────────

type NcbRow = Record<string, unknown>;

interface McpResult {
  ok: boolean;
  results: Array<{
    kind: string;
    rows: NcbRow[];
    rowCount: number;
    insertId?: number;
  }>;
  error?: string;
}

async function sql(query: string): Promise<NcbRow[]> {
  const res = await fetch(NCB_MCP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${NCB_TOKEN}`,
    },
    body: JSON.stringify({
      method: "tools/call",
      params: {
        name: "execute_sql",
        arguments: { database: NCB_INSTANCE, sql: query },
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`NCB MCP request failed: ${res.status}`);

  const raw = await res.json();
  const parsed: McpResult = typeof raw === "string" ? JSON.parse(raw) : raw;

  if (!parsed.ok) throw new Error(`NCB SQL error: ${parsed.error ?? "unknown"}`);

  return parsed.results?.[0]?.rows ?? [];
}

async function sqlInsert(query: string): Promise<number> {
  const res = await fetch(NCB_MCP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${NCB_TOKEN}`,
    },
    body: JSON.stringify({
      method: "tools/call",
      params: {
        name: "execute_sql",
        arguments: { database: NCB_INSTANCE, sql: query },
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`NCB MCP insert failed: ${res.status}`);

  const raw = await res.json();
  const parsed: McpResult = typeof raw === "string" ? JSON.parse(raw) : raw;

  if (!parsed.ok) throw new Error(`NCB SQL error: ${parsed.error ?? "unknown"}`);

  return parsed.results?.[0]?.insertId ?? parsed.results?.[0]?.rowCount ?? 0;
}

// ─── SQL escape helpers ───────────────────────────────────────────────────────
//
// SECURITY (S1): NoCodeBackend's MCP `execute_sql` takes a raw SQL string and
// does not expose bind variables. Because we cannot use parameterised queries,
// every value interpolated into a query MUST be funnelled through one of the
// typed escape helpers below. Each helper enforces a strict allow-list for its
// type:
//
//   - escInt    → integers only, coerced through Number.isFinite + Math.trunc
//   - escEnum   → must match a provided literal allow-list
//   - escUuid   → must match a strict UUID/NCB-id regex
//   - escBool   → rendered as 1 or 0
//   - escString → MySQL-safe escape of single quotes, backslash, backtick,
//                 NUL, ^Z (EOF), CRLF, and the SQL-comment sequences `--`,
//                 `#`, `/*`, `*/`. Also strips BOM/zero-width marks and any
//                 Unicode control characters that mysql's charset conversion
//                 could otherwise smuggle through. The final payload is
//                 validated against `\p{L}\p{N}\p{P}\p{Zs}\p{M}\p{S}` and any
//                 character outside that set is rejected.
//   - esc       → dispatch wrapper that routes to the right helper for legacy
//                 call sites. NEW call sites should prefer the typed helpers.
//
// Any change to these helpers requires re-audit by @security-auditor.

const UUID_RE =
  /^[a-zA-Z0-9_-]{1,64}$/; // NCB ids are short alphanumeric strings; real UUIDs also match.

function escInt(val: unknown): string {
  if (val === null || val === undefined) return "NULL";
  const n = typeof val === "number" ? val : Number(val);
  if (!Number.isFinite(n)) return "NULL";
  return String(Math.trunc(n));
}

function escBool(val: unknown): string {
  return val ? "1" : "0";
}

function escEnum(val: unknown, allowed: readonly string[]): string {
  if (val === null || val === undefined) return "NULL";
  const s = String(val);
  if (!allowed.includes(s)) {
    throw new Error(`SQL value rejected: not in allow-list (${allowed.join(",")})`);
  }
  return `'${s}'`;
}

function escUuid(val: unknown): string {
  if (val === null || val === undefined) return "NULL";
  const s = String(val);
  if (!UUID_RE.test(s)) {
    throw new Error(`SQL value rejected: not a valid id: ${s.slice(0, 24)}`);
  }
  return `'${s}'`;
}

// SECURITY (S1): Hardened MySQL string escape. Applies in order:
//   1. Strip BOM / zero-width marks (U+FEFF, U+200B–U+200F, U+2028/U+2029)
//      which some mysql client charsets decode into quote-terminators.
//   2. Reject any character not in {L,N,P,Zs,M,S} — this whitelists letters,
//      numbers, punctuation, spaces, combining marks, and symbols, and blocks
//      C0/C1 controls, ASCII NUL, and raw ^Z.
//   3. Escape backslash, single quote, backtick, CR, LF, NUL, ^Z.
//   4. Neutralise SQL comment starters — "--", "#", slash-star, star-slash —
//      by escaping an inner character so the token can never appear in the
//      emitted SQL even if an attacker smuggled it past step 2.
const BACKTICK = String.fromCharCode(0x60);

function escString(val: unknown): string {
  if (val === null || val === undefined) return "NULL";
  const raw = String(val)
    .replace(/\uFEFF/g, "")
    .replace(/[\u200B-\u200F\u2028\u2029]/g, "");
  if (/[^\p{L}\p{N}\p{P}\p{Zs}\p{M}\p{S}]/u.test(raw)) {
    throw new Error("SQL value rejected: contains disallowed control/format character");
  }
  const escaped = raw
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "''")
    .split(BACKTICK).join("\\" + BACKTICK)
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(/\0/g, "")
    .replace(/\x1a/g, "")
    // Neutralise comment starters after all other escaping — insert a backslash
    // between the two chars so the sequence cannot appear in the final SQL.
    .replace(/--/g, "-\\-")
    .replace(/#/g, "\\#")
    .replace(/\/\*/g, "/\\*")
    .replace(/\*\//g, "*\\/");
  return "'" + escaped + "'";
}

/**
 * Dispatch wrapper for legacy call sites. New code should use the typed
 * helpers (escInt, escUuid, escEnum, escString, escBool) directly.
 */
function esc(val: unknown): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number") return escInt(val);
  if (typeof val === "boolean") return escBool(val);
  return escString(val);
}

// ─── Serialization helpers ────────────────────────────────────────────────────

function parseJson<T>(val: unknown, fallback: T): T {
  if (val == null) return fallback;
  if (typeof val === "string") {
    try { return JSON.parse(val) as T; } catch { return fallback; }
  }
  return val as T;
}

function bool(val: unknown): boolean {
  return val === 1 || val === true || val === "1" || val === "true";
}

function str(val: unknown): string {
  return val == null ? "" : String(val);
}

function num(val: unknown): number {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function maybe<T>(val: unknown, parse: (v: unknown) => T): T | undefined {
  return val == null || val === "" ? undefined : parse(val);
}

function nowSql(): string {
  return new Date().toISOString().replace("T", " ").split(".")[0];
}

// ─── User mappers ─────────────────────────────────────────────────────────────

function rowToUser(row: NcbRow): User {
  return {
    id: str(row.id),
    clerkUserId: str(row.clerk_user_id),
    email: str(row.email),
    displayName: str(row.display_name),
    brandName: str(row.brand_name),
    niche: maybe(row.niche, str),
    tone: (row.tone as User["tone"]) ?? "casual",
    platforms: parseJson(row.platforms, []),
    onboardingComplete: bool(row.onboarding_complete),
    subscriptionTier: (row.subscription_tier as User["subscriptionTier"]) ?? "trial",
    currentPeriodEnd: maybe(row.current_period_end, num),
    trialStartedAt: maybe(row.trial_started_at, str),
    trialEndsAt: maybe(row.trial_ends_at, str),
    voiceProfileId: maybe(row.voice_profile_id, str),
    createdAt: str(row.created_at) || new Date().toISOString(),
  };
}

// ─── Video mappers ────────────────────────────────────────────────────────────

function rowToVideo(row: NcbRow): Video {
  return {
    id: str(row.id),
    userId: str(row.user_id),
    weekId: str(row.week_id),
    seriesId: maybe(row.series_id, str),
    title: str(row.title),
    scriptJson: parseJson(row.script_json, { hook: "", body: "", cta: "" }),
    platformHooks: row.platform_hooks
      ? parseJson(row.platform_hooks, {} as Record<string, string>)
      : undefined,
    platform: (row.platform as Video["platform"]) ?? "youtube",
    dayOfWeek: (row.day_of_week as Video["dayOfWeek"]) ?? "mon",
    facelessStyle: (row.faceless_style as Video["facelessStyle"]) ?? "dev-log",
    durationSeconds: num(row.duration_seconds),
    contentType: (row.content_type as Video["contentType"]) ?? "founder-story",
    status: (row.status as Video["status"]) ?? "draft",
    outputUrl: maybe(row.output_url, str),
    thumbnailUrl: maybe(row.thumbnail_url, str),
    renderJobId: maybe(row.render_job_id, str),
    topicLabel: maybe(row.topic_label, (v) => v as Video["topicLabel"]),
    hookType: maybe(row.hook_type, (v) => v as Video["hookType"]),
    sentiment: maybe(row.sentiment, (v) => v as Video["sentiment"]),
    specificityScore: maybe(row.specificity_score, num),
    watchTimeAvg: maybe(row.watch_time_avg, num),
    viewCount: maybe(row.view_count, num),
    engagementRate: maybe(row.engagement_rate, num),
    ctr: maybe(row.ctr, num),
    trafficFromPseo: maybe(row.traffic_from_pseo, num),
    visibilityScore: maybe(row.visibility_score, num),
    platformVideoId: maybe(row.platform_video_id, str),
    revisionCount: maybe(row.revision_count, num),
    createdAt: str(row.created_at) || new Date().toISOString(),
    publishedAt: maybe(row.published_at, str),
  };
}

// ─── ContentWeek mappers ──────────────────────────────────────────────────────

function rowToContentWeek(row: NcbRow): ContentWeek {
  return {
    id: str(row.id),
    userId: str(row.user_id),
    weekNumber: num(row.week_number),
    year: num(row.year),
    startDate: str(row.start_date),
    endDate: str(row.end_date),
    mode: ((row.mode as ContentWeek["mode"]) ?? "manual"),
    contentSource: ((row.content_source as ContentWeek["contentSource"]) ?? "user_input"),
    qualityGateAnswers: row.quality_gate_answers
      ? (parseJson(row.quality_gate_answers, ["", "", ""]) as [string, string, string])
      : undefined,
    specificityScore: maybe(row.specificity_score, num),
    autopilotAngles: row.autopilot_angles
      ? (parseJson(row.autopilot_angles, []) as string[])
      : undefined,
    seriesId: maybe(row.series_id, str),
    seriesEpisodeOffset: maybe(row.series_episode_offset, num),
    status: (row.status as ContentWeek["status"]) ?? "generating",
    videoCount: num(row.video_count),
    createdAt: str(row.created_at) || new Date().toISOString(),
  };
}

// ─── RenderJob mappers ────────────────────────────────────────────────────────

function rowToRenderJob(row: NcbRow): RenderJob {
  return {
    id: str(row.id),
    userId: str(row.user_id),
    videoId: str(row.video_id),
    status: (row.status as RenderJob["status"]) ?? "queued",
    outputUrl: maybe(row.output_url, str),
    errorMessage: maybe(row.error_message, str),
    createdAt: str(row.created_at) || new Date().toISOString(),
    completedAt: maybe(row.completed_at, str),
  };
}

// ─── VoiceProfile mappers ─────────────────────────────────────────────────────

function rowToVoiceProfile(row: NcbRow): VoiceProfile {
  return {
    id: str(row.id),
    userId: str(row.user_id),
    elevenLabsVoiceId: str(row.eleven_labs_voice_id),
    name: str(row.name),
    isClone: bool(row.is_clone),
    createdAt: str(row.created_at) || new Date().toISOString(),
  };
}

// ─── PseoPage mappers ─────────────────────────────────────────────────────────

function rowToPseoPage(row: NcbRow): PseoPage {
  return {
    id: str(row.id),
    userId: str(row.user_id),
    videoId: str(row.video_id),
    title: str(row.title),
    slug: str(row.slug),
    htmlContent: str(row.html_content),
    metaDescription: maybe(row.meta_description, str),
    ogImage: maybe(row.og_image, str),
    faqJson: maybe(row.faq_json, str),
    videoObjectJsonLd: maybe(row.video_object_json_ld, str),
    canonicalUrl: str(row.canonical_url),
    indexed: bool(row.indexed),
    indexedAt: maybe(row.indexed_at, str),
    viewCount: num(row.view_count),
    createdAt: str(row.created_at) || new Date().toISOString(),
  };
}

// ─── User ─────────────────────────────────────────────────────────────────────

export async function getUser(userId: string): Promise<User | null> {
  const rows = await sql(`SELECT * FROM users WHERE id = ${esc(userId)} LIMIT 1`);
  return rows.length > 0 ? rowToUser(rows[0]) : null;
}

export async function getUserByClerkId(clerkUserId: string): Promise<User | null> {
  const rows = await sql(
    `SELECT * FROM users WHERE clerk_user_id = ${esc(clerkUserId)} LIMIT 1`
  );
  return rows.length > 0 ? rowToUser(rows[0]) : null;
}

export async function createUser(data: Omit<User, "id" | "createdAt">): Promise<User> {
  const trialStart = new Date().toISOString().replace("T", " ").split(".")[0];
  const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString().replace("T", " ").split(".")[0];

  const id = await sqlInsert(
    `INSERT INTO users (clerk_user_id, email, display_name, brand_name, niche, tone, platforms,
      onboarding_complete, subscription_tier, trial_started_at, trial_ends_at, voice_profile_id, created_at)
     VALUES (${esc(data.clerkUserId)}, ${esc(data.email)}, ${esc(data.displayName)}, ${esc(data.brandName)},
             ${esc(data.niche ?? null)}, ${esc(data.tone)}, ${esc(JSON.stringify(data.platforms))},
             ${data.onboardingComplete ? 1 : 0}, ${esc(data.subscriptionTier ?? "trial")},
             ${esc(trialStart)}, ${esc(trialEnd)}, ${esc(data.voiceProfileId ?? null)}, ${esc(nowSql())})`
  );
  return { ...data, id: String(id), createdAt: new Date().toISOString() };
}

export async function updateUser(userId: string, data: Partial<User>): Promise<User> {
  const sets: string[] = [];
  if (data.email !== undefined) sets.push(`email = ${esc(data.email)}`);
  if (data.displayName !== undefined) sets.push(`display_name = ${esc(data.displayName)}`);
  if (data.brandName !== undefined) sets.push(`brand_name = ${esc(data.brandName)}`);
  if (data.niche !== undefined) sets.push(`niche = ${esc(data.niche)}`);
  if (data.tone !== undefined) sets.push(`tone = ${esc(data.tone)}`);
  if (data.platforms !== undefined) sets.push(`platforms = ${esc(JSON.stringify(data.platforms))}`);
  if (data.onboardingComplete !== undefined) sets.push(`onboarding_complete = ${data.onboardingComplete ? 1 : 0}`);
  if (data.subscriptionTier !== undefined) sets.push(`subscription_tier = ${esc(data.subscriptionTier)}`);
  if (data.voiceProfileId !== undefined) sets.push(`voice_profile_id = ${esc(data.voiceProfileId)}`);
  // Requires column: `current_period_end BIGINT NULL`. Falls through harmlessly
  // until the migration lands in prod (the SQL error would surface but the
  // happy path — fresh subscriptions without a recorded periodEnd — won't set it).
  if (data.currentPeriodEnd !== undefined) {
    sets.push(
      `current_period_end = ${data.currentPeriodEnd === null ? "NULL" : escInt(data.currentPeriodEnd)}`
    );
  }
  if (sets.length > 0) {
    await sql(`UPDATE users SET ${sets.join(", ")} WHERE id = ${esc(userId)}`);
  }
  const updated = await getUser(userId);
  if (!updated) throw new Error(`User ${userId} not found after update`);
  return updated;
}

// ─── VoiceProfile ─────────────────────────────────────────────────────────────

export async function getVoiceProfile(profileId: string): Promise<VoiceProfile | null> {
  const rows = await sql(`SELECT * FROM voice_profiles WHERE id = ${esc(profileId)} LIMIT 1`);
  return rows.length > 0 ? rowToVoiceProfile(rows[0]) : null;
}

export async function getVoiceProfilesForUser(userId: string): Promise<VoiceProfile[]> {
  const rows = await sql(`SELECT * FROM voice_profiles WHERE user_id = ${esc(userId)}`);
  return rows.map(rowToVoiceProfile);
}

export async function createVoiceProfile(
  data: Omit<VoiceProfile, "id" | "createdAt">
): Promise<VoiceProfile> {
  const id = await sqlInsert(
    `INSERT INTO voice_profiles (user_id, eleven_labs_voice_id, name, is_clone, created_at)
     VALUES (${esc(data.userId)}, ${esc(data.elevenLabsVoiceId)}, ${esc(data.name)},
             ${data.isClone ? 1 : 0}, ${esc(nowSql())})`
  );
  return { ...data, id: String(id), createdAt: new Date().toISOString() };
}

/**
 * Delete every voice profile belonging to a user — used by the "Delete my
 * clone" button in settings. Also clears `users.voice_profile_id` so the
 * render pipeline falls back to the library voice on the next job.
 */
export async function deleteVoiceProfilesForUser(userId: string): Promise<void> {
  try {
    await sql(`DELETE FROM voice_profiles WHERE user_id = ${esc(userId)}`);
    await sql(
      `UPDATE users SET voice_profile_id = NULL WHERE clerk_user_id = ${esc(userId)}`,
    );
  } catch (err) {
    console.warn("[voice] deleteVoiceProfilesForUser failed:", err);
  }
}

// ─── ContentWeek ──────────────────────────────────────────────────────────────

export async function getCurrentWeek(userId: string): Promise<ContentWeek | null> {
  const rows = await sql(
    `SELECT * FROM content_weeks WHERE user_id = ${esc(userId)} ORDER BY created_at DESC LIMIT 1`
  );
  return rows.length > 0 ? rowToContentWeek(rows[0]) : null;
}

export async function getWeekById(weekId: string): Promise<ContentWeek | null> {
  const rows = await sql(`SELECT * FROM content_weeks WHERE id = ${esc(weekId)} LIMIT 1`);
  return rows.length > 0 ? rowToContentWeek(rows[0]) : null;
}

export async function createContentWeek(
  data: Omit<ContentWeek, "id" | "createdAt">
): Promise<ContentWeek> {
  const id = await sqlInsert(
    `INSERT INTO content_weeks (user_id, week_number, year, start_date, end_date,
      quality_gate_answers, specificity_score, status, video_count, created_at)
     VALUES (${esc(data.userId)}, ${esc(data.weekNumber)}, ${esc(data.year)},
             ${esc(data.startDate)}, ${esc(data.endDate)},
             ${esc(JSON.stringify(data.qualityGateAnswers))}, ${esc(data.specificityScore ?? null)},
             ${esc(data.status)}, ${esc(data.videoCount)}, ${esc(nowSql())})`
  );
  return { ...data, id: String(id), createdAt: new Date().toISOString() };
}

export async function updateWeekStatus(
  weekId: string,
  status: ContentWeek["status"]
): Promise<void> {
  await sql(`UPDATE content_weeks SET status = ${esc(status)} WHERE id = ${esc(weekId)}`);
}

// ─── Videos ───────────────────────────────────────────────────────────────────

export async function getVideosForWeek(weekId: string): Promise<Video[]> {
  const rows = await sql(
    `SELECT * FROM videos WHERE week_id = ${esc(weekId)} ORDER BY day_of_week ASC, created_at ASC`
  );
  return rows.map(rowToVideo);
}

export async function getVideo(videoId: string): Promise<Video | null> {
  const rows = await sql(`SELECT * FROM videos WHERE id = ${esc(videoId)} LIMIT 1`);
  return rows.length > 0 ? rowToVideo(rows[0]) : null;
}

export async function getVideos(userId: string): Promise<Video[]> {
  const rows = await sql(
    `SELECT * FROM videos WHERE user_id = ${esc(userId)} ORDER BY created_at DESC`
  );
  return rows.map(rowToVideo);
}

export async function createVideo(data: Omit<Video, "id" | "createdAt">): Promise<Video> {
  const id = await sqlInsert(
    `INSERT INTO videos (user_id, week_id, series_id, title, script_json, platform_hooks,
      platform, day_of_week, faceless_style, duration_seconds, content_type, status,
      output_url, thumbnail_url, render_job_id, topic_label, hook_type, sentiment,
      specificity_score, watch_time_avg, view_count, engagement_rate, ctr,
      traffic_from_pseo, visibility_score, platform_video_id, created_at, published_at)
     VALUES (${esc(data.userId)}, ${esc(data.weekId)}, ${esc(data.seriesId ?? null)},
             ${esc(data.title)}, ${esc(JSON.stringify(data.scriptJson))},
             ${esc(data.platformHooks ? JSON.stringify(data.platformHooks) : null)},
             ${esc(data.platform)},
             ${esc(data.dayOfWeek)}, ${esc(data.facelessStyle)}, ${esc(data.durationSeconds)},
             ${esc(data.contentType)}, ${esc(data.status)}, ${esc(data.outputUrl ?? null)},
             ${esc(data.thumbnailUrl ?? null)}, ${esc(data.renderJobId ?? null)},
             ${esc(data.topicLabel ?? null)}, ${esc(data.hookType ?? null)},
             ${esc(data.sentiment ?? null)}, ${esc(data.specificityScore ?? null)},
             ${esc(data.watchTimeAvg ?? null)}, ${esc(data.viewCount ?? 0)},
             ${esc(data.engagementRate ?? null)}, ${esc(data.ctr ?? null)},
             ${esc(data.trafficFromPseo ?? 0)}, ${esc(data.visibilityScore ?? null)},
             ${esc(data.platformVideoId ?? null)}, ${esc(nowSql())}, ${esc(data.publishedAt ?? null)})`
  );
  return { ...data, id: String(id), createdAt: new Date().toISOString() };
}

export async function updateVideo(videoId: string, data: Partial<Video>): Promise<Video> {
  const sets: string[] = [];
  if (data.title !== undefined) sets.push(`title = ${esc(data.title)}`);
  if (data.scriptJson !== undefined) sets.push(`script_json = ${esc(JSON.stringify(data.scriptJson))}`);
  if (data.status !== undefined) sets.push(`status = ${esc(data.status)}`);
  if (data.outputUrl !== undefined) sets.push(`output_url = ${esc(data.outputUrl)}`);
  if (data.thumbnailUrl !== undefined) sets.push(`thumbnail_url = ${esc(data.thumbnailUrl)}`);
  if (data.renderJobId !== undefined) sets.push(`render_job_id = ${esc(data.renderJobId)}`);
  if (data.topicLabel !== undefined) sets.push(`topic_label = ${esc(data.topicLabel)}`);
  if (data.hookType !== undefined) sets.push(`hook_type = ${esc(data.hookType)}`);
  if (data.sentiment !== undefined) sets.push(`sentiment = ${esc(data.sentiment)}`);
  if (data.viewCount !== undefined) sets.push(`view_count = ${esc(data.viewCount)}`);
  if (data.visibilityScore !== undefined) sets.push(`visibility_score = ${esc(data.visibilityScore)}`);
  if (data.publishedAt !== undefined) sets.push(`published_at = ${esc(data.publishedAt)}`);
  if (data.platformVideoId !== undefined) sets.push(`platform_video_id = ${esc(data.platformVideoId)}`);
  // TODO(schema): add `revision_count INT DEFAULT 0` column to `videos` table.
  // Until the migration lands, writes here will fail if the column is absent;
  // callers must catch and fall back to counting revisions another way.
  if (data.revisionCount !== undefined) sets.push(`revision_count = ${esc(data.revisionCount)}`);
  if (sets.length > 0) {
    await sql(`UPDATE videos SET ${sets.join(", ")} WHERE id = ${esc(videoId)}`);
  }
  const updated = await getVideo(videoId);
  if (!updated) throw new Error(`Video ${videoId} not found after update`);
  return updated;
}

export async function updateVideoSchedule(
  videoId: string,
  day: string,
  time?: string
): Promise<void> {
  const sets: string[] = [`scheduled_day = ${escString(day)}`];
  if (time !== undefined) sets.push(`scheduled_time = ${escString(time)}`);
  await sql(`UPDATE videos SET ${sets.join(", ")} WHERE id = ${escUuid(videoId)}`);
}

export async function updateVideoScript(videoId: string, script: string): Promise<void> {
  // Load existing video to preserve hook and cta in script_json
  const video = await getVideo(videoId);
  if (!video) throw new Error(`Video ${videoId} not found`);
  const updatedScript = { ...video.scriptJson, body: script };
  await sql(
    `UPDATE videos SET script_json = ${esc(JSON.stringify(updatedScript))} WHERE id = ${esc(videoId)}`
  );
}

export async function approveVideo(videoId: string): Promise<Video> {
  return updateVideo(videoId, { status: "approved" });
}


export async function approveAllForWeek(weekId: string): Promise<void> {
  await sql(
    `UPDATE videos SET status = 'approved' WHERE week_id = ${esc(weekId)} AND status = 'draft'`
  );
}

export async function getTopPerformingVideos(userId: string, limit = 10): Promise<Video[]> {
  // SECURITY (S1): LIMIT value is coerced via escInt, never interpolated raw.
  const rows = await sql(
    `SELECT * FROM videos WHERE user_id = ${escUuid(userId)} AND visibility_score IS NOT NULL
     ORDER BY visibility_score DESC LIMIT ${escInt(limit)}`
  );
  return rows.map(rowToVideo);
}

// ─── RenderJobs ───────────────────────────────────────────────────────────────

export async function getRenderJob(jobId: string): Promise<RenderJob | null> {
  const rows = await sql(`SELECT * FROM render_jobs WHERE id = ${esc(jobId)} LIMIT 1`);
  return rows.length > 0 ? rowToRenderJob(rows[0]) : null;
}

export async function createRenderJob(
  data: Omit<RenderJob, "id" | "createdAt">
): Promise<RenderJob> {
  const id = await sqlInsert(
    `INSERT INTO render_jobs (user_id, video_id, status, output_url, error_message, created_at)
     VALUES (${esc(data.userId)}, ${esc(data.videoId)}, ${esc(data.status)},
             ${esc(data.outputUrl ?? null)}, ${esc(data.errorMessage ?? null)}, ${esc(nowSql())})`
  );
  return { ...data, id: String(id), createdAt: new Date().toISOString() };
}

export async function updateRenderJob(
  jobId: string,
  data: Partial<RenderJob>
): Promise<RenderJob> {
  const sets: string[] = [];
  if (data.status !== undefined) sets.push(`status = ${esc(data.status)}`);
  if (data.outputUrl !== undefined) sets.push(`output_url = ${esc(data.outputUrl)}`);
  if (data.errorMessage !== undefined) sets.push(`error_message = ${esc(data.errorMessage)}`);
  if (data.completedAt !== undefined) sets.push(`completed_at = ${esc(data.completedAt)}`);
  if (sets.length > 0) {
    await sql(`UPDATE render_jobs SET ${sets.join(", ")} WHERE id = ${esc(jobId)}`);
  }
  const updated = await getRenderJob(jobId);
  if (!updated) throw new Error(`RenderJob ${jobId} not found after update`);
  return updated;
}

// ─── pSEO ─────────────────────────────────────────────────────────────────────

export async function getPseoPage(slug: string): Promise<PseoPage | null> {
  const rows = await sql(`SELECT * FROM pseo_pages WHERE slug = ${esc(slug)} LIMIT 1`);
  return rows.length > 0 ? rowToPseoPage(rows[0]) : null;
}

export async function getPseoPageByVideoId(videoId: string): Promise<PseoPage | null> {
  const rows = await sql(
    `SELECT * FROM pseo_pages WHERE video_id = ${esc(videoId)} LIMIT 1`
  );
  return rows.length > 0 ? rowToPseoPage(rows[0]) : null;
}

export async function createPseoPage(
  data: Omit<PseoPage, "id" | "createdAt" | "indexed" | "viewCount">
): Promise<PseoPage> {
  const id = await sqlInsert(
    `INSERT INTO pseo_pages (user_id, video_id, title, slug, html_content, meta_description,
      og_image, faq_json, video_object_json_ld, canonical_url, indexed, view_count, created_at)
     VALUES (${esc(data.userId)}, ${esc(data.videoId)}, ${esc(data.title)}, ${esc(data.slug)},
             ${esc(data.htmlContent)}, ${esc(data.metaDescription ?? null)},
             ${esc(data.ogImage ?? null)}, ${esc(data.faqJson ?? null)},
             ${esc(data.videoObjectJsonLd ?? null)}, ${esc(data.canonicalUrl)}, 0, 0, ${esc(nowSql())})`
  );
  return { ...data, id: String(id), indexed: false, viewCount: 0, createdAt: new Date().toISOString() };
}

// ─── Stripe webhook idempotency (critical path #2) ────────────────────────────

/**
 * Insert-once for Stripe event IDs. Returns true if this is the first time the
 * event was seen, false if it was already processed.
 *
 * REQUIRED TABLE (run once in NCB):
 *   CREATE TABLE processed_stripe_events (
 *     event_id   VARCHAR(255) NOT NULL PRIMARY KEY,
 *     event_type VARCHAR(100) NOT NULL,
 *     processed_at DATETIME    NOT NULL
 *   );
 *
 * Implementation strategy: SELECT-then-INSERT. NCB MCP doesn't expose
 * INSERT IGNORE return values cleanly, so we check first. Race window is small
 * (Stripe retries are seconds apart, not microseconds) and the worst case is
 * a duplicate INSERT failing on PRIMARY KEY — caller still sees `false` from
 * the catch path.
 */
export async function recordStripeEvent(eventId: string): Promise<boolean> {
  const existing = await sql(
    `SELECT event_id FROM processed_stripe_events WHERE event_id = ${esc(eventId)} LIMIT 1`
  ).catch(() => [] as NcbRow[]);

  if (existing.length > 0) return false;

  try {
    await sqlInsert(
      `INSERT INTO processed_stripe_events (event_id, event_type, processed_at)
       VALUES (${esc(eventId)}, ${esc("stripe_event")}, ${esc(nowSql())})`
    );
    return true;
  } catch {
    // Duplicate-key race: someone else inserted between our SELECT and INSERT.
    return false;
  }
}

// ─── Voice clone consent (critical path #7) ───────────────────────────────────

/**
 * REQUIRED TABLE (run once in NCB):
 *   CREATE TABLE voice_consent_records (
 *     user_id      VARCHAR(255) NOT NULL PRIMARY KEY,
 *     consented_at DATETIME     NOT NULL,
 *     ip_address   VARCHAR(64),
 *     user_agent   VARCHAR(500)
 *   );
 *
 * Persist consent BEFORE any ElevenLabs cloneVoice request. Required by
 * ElevenLabs ToS and most biometric privacy laws (GDPR, CPRA, BIPA).
 */
export async function recordVoiceConsent(params: {
  userId: string;
  consentedAt: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{
  userId: string;
  consentedAt: string;
  ipAddress?: string;
  userAgent?: string;
}> {
  // Upsert: delete any prior record for this user, then insert fresh.
  await sql(
    `DELETE FROM voice_consent_records WHERE user_id = ${esc(params.userId)}`
  ).catch(() => undefined);
  await sqlInsert(
    `INSERT INTO voice_consent_records (user_id, consented_at, ip_address, user_agent)
     VALUES (${esc(params.userId)}, ${esc(params.consentedAt)},
             ${esc(params.ipAddress ?? null)}, ${esc(params.userAgent ?? null)})`
  );
  return params;
}

export async function hasVoiceConsent(userId: string): Promise<boolean> {
  const rows = await sql(
    `SELECT user_id FROM voice_consent_records WHERE user_id = ${esc(userId)} LIMIT 1`
  ).catch(() => [] as NcbRow[]);
  return rows.length > 0;
}

// ─── GDPR: cascade delete + export (Article 17 + 20) ─────────────────────────

/**
 * Return every row tied to a user, grouped by table. Used by the data-export
 * endpoint (Article 20). Caller is responsible for stripping third-party IDs
 * before sending to the client.
 */
export async function getAllUserData(userId: string): Promise<{
  user: User | null;
  voiceProfiles: VoiceProfile[];
  weeks: ContentWeek[];
  videos: Video[];
  pseoPages: PseoPage[];
}> {
  const [userRow, voiceRows, weekRows, videoRows, pseoRows] = await Promise.all([
    sql(`SELECT * FROM users WHERE id = ${escUuid(userId)} LIMIT 1`),
    sql(`SELECT * FROM voice_profiles WHERE user_id = ${escUuid(userId)}`),
    sql(`SELECT * FROM content_weeks WHERE user_id = ${escUuid(userId)} ORDER BY created_at ASC`),
    sql(`SELECT * FROM videos WHERE user_id = ${escUuid(userId)} ORDER BY created_at ASC`),
    sql(`SELECT * FROM pseo_pages WHERE user_id = ${escUuid(userId)} ORDER BY created_at ASC`),
  ]);
  return {
    user: userRow.length > 0 ? rowToUser(userRow[0]) : null,
    voiceProfiles: voiceRows.map(rowToVoiceProfile),
    weeks: weekRows.map(rowToContentWeek),
    videos: videoRows.map(rowToVideo),
    pseoPages: pseoRows.map(rowToPseoPage),
  };
}

/**
 * Permanently delete a user and every row that references them. GDPR Article 17.
 *
 * Order matters: child tables first, user row last. NCB's MCP API has no
 * transactional envelope exposed, so we issue each DELETE individually. A
 * mid-flight failure leaves an orphaned parent row the user can retry against,
 * which is the least-bad failure mode.
 *
 * R2 objects, ElevenLabs voices, and Stripe subscriptions are NOT deleted here
 * — those are best-effort cleanups handled by the API route before this call.
 */
export async function deleteUserAndData(userId: string): Promise<void> {
  const uid = escUuid(userId);
  // Children referencing videos (pseo, render_jobs) by user_id
  await sql(`DELETE FROM pseo_pages WHERE user_id = ${uid}`).catch(() => undefined);
  await sql(`DELETE FROM render_jobs WHERE user_id = ${uid}`).catch(() => undefined);
  // Videos, weeks, voice profiles
  await sql(`DELETE FROM videos WHERE user_id = ${uid}`).catch(() => undefined);
  await sql(`DELETE FROM content_weeks WHERE user_id = ${uid}`).catch(() => undefined);
  await sql(`DELETE FROM voice_profiles WHERE user_id = ${uid}`).catch(() => undefined);
  // Consent record
  await sql(`DELETE FROM voice_consent_records WHERE user_id = ${uid}`).catch(() => undefined);
  // User row last
  await sql(`DELETE FROM users WHERE id = ${uid}`);
}

// ─── Webhook subscriptions ────────────────────────────────────────────────────

/**
 * TODO(migration): create table `webhook_subscriptions`:
 *
 *   CREATE TABLE webhook_subscriptions (
 *     id             VARCHAR(64)  NOT NULL PRIMARY KEY,
 *     user_id        VARCHAR(255) NOT NULL,
 *     url            VARCHAR(500) NOT NULL,
 *     events         TEXT         NOT NULL,  -- JSON array of event strings
 *     secret         VARCHAR(128) NOT NULL,
 *     status         VARCHAR(32)  NOT NULL DEFAULT 'active',
 *     last_delivered_at DATETIME,
 *     last_error_message VARCHAR(500),
 *     created_at     DATETIME     NOT NULL,
 *     INDEX user_idx (user_id)
 *   );
 *
 * Until the migration lands every call is wrapped in try/catch + no-op so
 * the feature degrades gracefully (mock path is authoritative in dev).
 */

import type {
  WebhookSubscription,
  WebhookEventType,
  WebhookStatus,
} from "@/lib/types/webhook";

const WEBHOOK_STATUSES = ["active", "degraded", "disabled"] as const;

function rowToWebhook(row: NcbRow): WebhookSubscription {
  return {
    id: str(row.id),
    userId: str(row.user_id),
    url: str(row.url),
    events: parseJson<WebhookEventType[]>(row.events, []),
    secret: str(row.secret),
    status: (row.status as WebhookStatus) ?? "active",
    lastDeliveredAt: maybe(row.last_delivered_at, str),
    lastErrorMessage: maybe(row.last_error_message, str),
    createdAt: str(row.created_at) || new Date().toISOString(),
  };
}

export async function listWebhookSubscriptions(
  userId: string
): Promise<WebhookSubscription[]> {
  try {
    const rows = await sql(
      `SELECT * FROM webhook_subscriptions WHERE user_id = ${escUuid(userId)} ORDER BY created_at DESC`
    );
    return rows.map(rowToWebhook);
  } catch (err) {
    console.warn("[webhooks] listWebhookSubscriptions failed (migration pending?):", err);
    return [];
  }
}

export async function getWebhookSubscription(
  id: string
): Promise<WebhookSubscription | null> {
  try {
    const rows = await sql(
      `SELECT * FROM webhook_subscriptions WHERE id = ${escUuid(id)} LIMIT 1`
    );
    return rows.length > 0 ? rowToWebhook(rows[0]) : null;
  } catch (err) {
    console.warn("[webhooks] getWebhookSubscription failed:", err);
    return null;
  }
}

export async function createWebhookSubscription(
  data: Omit<WebhookSubscription, "id" | "createdAt">
): Promise<WebhookSubscription> {
  const id = `whk_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = new Date().toISOString();
  try {
    await sqlInsert(
      `INSERT INTO webhook_subscriptions (id, user_id, url, events, secret, status, created_at)
       VALUES (${escUuid(id)}, ${escUuid(data.userId)}, ${escString(data.url)},
               ${escString(JSON.stringify(data.events))},
               ${escString(data.secret)},
               ${escEnum(data.status, WEBHOOK_STATUSES)},
               ${escString(nowSql())})`
    );
  } catch (err) {
    console.warn("[webhooks] createWebhookSubscription insert failed:", err);
  }
  return { ...data, id, createdAt };
}

export async function updateWebhookSubscription(
  id: string,
  patch: Partial<
    Pick<
      WebhookSubscription,
      "url" | "events" | "status" | "lastDeliveredAt" | "lastErrorMessage"
    >
  >
): Promise<WebhookSubscription | null> {
  try {
    const sets: string[] = [];
    if (patch.url !== undefined) sets.push(`url = ${escString(patch.url)}`);
    if (patch.events !== undefined)
      sets.push(`events = ${escString(JSON.stringify(patch.events))}`);
    if (patch.status !== undefined)
      sets.push(`status = ${escEnum(patch.status, WEBHOOK_STATUSES)}`);
    if (patch.lastDeliveredAt !== undefined)
      sets.push(`last_delivered_at = ${escString(patch.lastDeliveredAt)}`);
    if (patch.lastErrorMessage !== undefined)
      sets.push(`last_error_message = ${escString(patch.lastErrorMessage)}`);
    if (sets.length > 0) {
      await sql(
        `UPDATE webhook_subscriptions SET ${sets.join(", ")} WHERE id = ${escUuid(id)}`
      );
    }
    return await getWebhookSubscription(id);
  } catch (err) {
    console.warn("[webhooks] updateWebhookSubscription failed:", err);
    return null;
  }
}

export async function deleteWebhookSubscription(id: string): Promise<boolean> {
  try {
    await sql(`DELETE FROM webhook_subscriptions WHERE id = ${escUuid(id)}`);
    return true;
  } catch (err) {
    console.warn("[webhooks] deleteWebhookSubscription failed:", err);
    return false;
  }
}

export async function findWebhookSubscriptionsForEvent(
  userId: string,
  event: WebhookEventType
): Promise<WebhookSubscription[]> {
  try {
    const rows = await sql(
      `SELECT * FROM webhook_subscriptions
         WHERE user_id = ${escUuid(userId)}
           AND status <> 'disabled'
           AND events LIKE ${escString(`%"${event}"%`)}`
    );
    return rows.map(rowToWebhook).filter((w) => w.events.includes(event));
  } catch (err) {
    console.warn("[webhooks] findWebhookSubscriptionsForEvent failed:", err);
    return [];
  }
}

// ─── Avatar waitlist (Phase 2 lead capture) ───────────────────────────────────

/**
 * REQUIRED TABLE (run once in NCB):
 *   CREATE TABLE avatar_waitlist (
 *     email     VARCHAR(255) NOT NULL PRIMARY KEY,
 *     joined_at DATETIME     NOT NULL
 *   );
 */
export async function addToAvatarWaitlist(email: string): Promise<{
  added: boolean;
  position: number;
}> {
  const normalized = email.trim().toLowerCase();

  const existing = await sql(
    `SELECT email FROM avatar_waitlist WHERE email = ${esc(normalized)} LIMIT 1`
  ).catch(() => [] as NcbRow[]);

  // Compute position by counting earlier rows; if duplicate, return its rank.
  if (existing.length > 0) {
    const earlier = await sql(
      `SELECT COUNT(*) AS c FROM avatar_waitlist
       WHERE joined_at <= (SELECT joined_at FROM avatar_waitlist WHERE email = ${esc(normalized)})`
    ).catch(() => [{ c: 0 }] as NcbRow[]);
    const position = Number((earlier[0]?.c as number | string) ?? 0) || 1;
    return { added: false, position };
  }

  try {
    await sqlInsert(
      `INSERT INTO avatar_waitlist (email, joined_at)
       VALUES (${esc(normalized)}, ${esc(nowSql())})`
    );
  } catch {
    // Duplicate-key race: someone else inserted just now. Fall through.
  }

  const total = await sql(
    `SELECT COUNT(*) AS c FROM avatar_waitlist`
  ).catch(() => [{ c: 1 }] as NcbRow[]);
  const position = Number((total[0]?.c as number | string) ?? 1) || 1;
  return { added: true, position };
}

// ─── WordPress connections ────────────────────────────────────────────────────
//
// REQUIRED TABLE (run once in NCB):
//   CREATE TABLE wordpress_connections (
//     id                       VARCHAR(64)  NOT NULL PRIMARY KEY,
//     user_id                  VARCHAR(64)  NOT NULL UNIQUE,
//     site_url                 VARCHAR(500) NOT NULL,
//     username                 VARCHAR(255) NOT NULL,
//     encrypted_app_password   TEXT         NOT NULL,
//     wp_user_id               INT          NULL,
//     last_tested_at           DATETIME     NOT NULL,
//     last_published_at        DATETIME     NULL,
//     enabled                  TINYINT(1)   NOT NULL DEFAULT 1,
//     created_at               DATETIME     NOT NULL,
//     updated_at               DATETIME     NOT NULL
//   );
//
// SECURITY: `encrypted_app_password` stores base64url(IV || CT || TAG) from
// AES-256-GCM. Plaintext never leaves the API route that processes /connect.

import type { WordPressConnectionRecord } from "@/lib/types/wordpress";

function rowToWordPress(row: NcbRow): WordPressConnectionRecord {
  return {
    id: str(row.id),
    userId: str(row.user_id),
    siteUrl: str(row.site_url),
    username: str(row.username),
    encryptedAppPassword: str(row.encrypted_app_password),
    wpUserId: row.wp_user_id == null ? undefined : num(row.wp_user_id),
    lastTestedAt: str(row.last_tested_at),
    lastPublishedAt: maybe(row.last_published_at, str),
    enabled: bool(row.enabled),
    createdAt: str(row.created_at) || new Date().toISOString(),
    updatedAt: str(row.updated_at) || new Date().toISOString(),
  };
}

export async function getWordPressConnection(
  userId: string
): Promise<WordPressConnectionRecord | null> {
  try {
    const rows = await sql(
      `SELECT * FROM wordpress_connections WHERE user_id = ${escUuid(userId)} LIMIT 1`
    );
    const row = rows[0];
    return row ? rowToWordPress(row) : null;
  } catch (err) {
    console.warn("[wordpress] getWordPressConnection failed:", err);
    return null;
  }
}

export async function upsertWordPressConnection(
  data: Omit<WordPressConnectionRecord, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
  }
): Promise<WordPressConnectionRecord> {
  const existing = await getWordPressConnection(data.userId);
  const now = nowSql();
  const id = existing?.id ?? data.id ?? `wpc_${Date.now()}`;

  if (existing) {
    await sql(
      `UPDATE wordpress_connections SET
          site_url               = ${escString(data.siteUrl)},
          username               = ${escString(data.username)},
          encrypted_app_password = ${escString(data.encryptedAppPassword)},
          wp_user_id             = ${escInt(data.wpUserId ?? null)},
          last_tested_at         = ${escString(data.lastTestedAt)},
          last_published_at      = ${data.lastPublishedAt ? escString(data.lastPublishedAt) : "NULL"},
          enabled                = ${escBool(data.enabled)},
          updated_at             = ${escString(now)}
         WHERE id = ${escUuid(id)}`
    );
  } else {
    await sqlInsert(
      `INSERT INTO wordpress_connections
         (id, user_id, site_url, username, encrypted_app_password,
          wp_user_id, last_tested_at, last_published_at, enabled,
          created_at, updated_at)
       VALUES (${escUuid(id)}, ${escUuid(data.userId)},
               ${escString(data.siteUrl)}, ${escString(data.username)},
               ${escString(data.encryptedAppPassword)},
               ${escInt(data.wpUserId ?? null)},
               ${escString(data.lastTestedAt)},
               ${data.lastPublishedAt ? escString(data.lastPublishedAt) : "NULL"},
               ${escBool(data.enabled)},
               ${escString(now)}, ${escString(now)})`
    );
  }

  const refreshed = await getWordPressConnection(data.userId);
  if (!refreshed) throw new Error("Failed to persist WordPress connection");
  return refreshed;
}

export async function updateWordPressConnection(
  userId: string,
  patch: Partial<
    Pick<
      WordPressConnectionRecord,
      | "siteUrl"
      | "username"
      | "encryptedAppPassword"
      | "wpUserId"
      | "lastTestedAt"
      | "lastPublishedAt"
      | "enabled"
    >
  >
): Promise<WordPressConnectionRecord | null> {
  const existing = await getWordPressConnection(userId);
  if (!existing) return null;

  const sets: string[] = [];
  if (patch.siteUrl !== undefined) sets.push(`site_url = ${escString(patch.siteUrl)}`);
  if (patch.username !== undefined) sets.push(`username = ${escString(patch.username)}`);
  if (patch.encryptedAppPassword !== undefined)
    sets.push(`encrypted_app_password = ${escString(patch.encryptedAppPassword)}`);
  if (patch.wpUserId !== undefined)
    sets.push(`wp_user_id = ${escInt(patch.wpUserId ?? null)}`);
  if (patch.lastTestedAt !== undefined)
    sets.push(`last_tested_at = ${escString(patch.lastTestedAt)}`);
  if (patch.lastPublishedAt !== undefined)
    sets.push(
      `last_published_at = ${patch.lastPublishedAt ? escString(patch.lastPublishedAt) : "NULL"}`
    );
  if (patch.enabled !== undefined) sets.push(`enabled = ${escBool(patch.enabled)}`);

  if (sets.length === 0) return existing;
  sets.push(`updated_at = ${escString(nowSql())}`);

  await sql(
    `UPDATE wordpress_connections SET ${sets.join(", ")} WHERE id = ${escUuid(existing.id)}`
  );
  return getWordPressConnection(userId);
}

export async function deleteWordPressConnection(userId: string): Promise<boolean> {
  try {
    await sql(`DELETE FROM wordpress_connections WHERE user_id = ${escUuid(userId)}`);
    return true;
  } catch (err) {
    console.warn("[wordpress] deleteWordPressConnection failed:", err);
    return false;
  }
}

// ─── Monthly video renders (credits / hard-cap enforcement) ──────────────────
//
// Schema (created by the NCB migration, see scripts/migrations):
//
//   CREATE TABLE monthly_video_renders (
//     id             INT AUTO_INCREMENT PRIMARY KEY,
//     clerk_user_id  VARCHAR(64)  NOT NULL,
//     `year_month`   VARCHAR(7)   NOT NULL,  -- "2026-04" (backticks: reserved word)
//     video_id       VARCHAR(64)  NOT NULL,
//     cost           INT          NOT NULL DEFAULT 1,  -- per-render credit cost
//     created_at     DATETIME     NOT NULL,
//     UNIQUE KEY uniq_user_month_video (clerk_user_id, `year_month`, video_id),
//     KEY idx_user_month (clerk_user_id, `year_month`)
//   );
//
// Usage is `SUM(cost)`, not `COUNT(*)`, so HeyGen renders (15 credits) count
// 15× a faceless render (1 credit) toward the monthly tier allocation. See
// lib/credits/costs.ts for the cost table.
//
// Atomicity contract: unique index + INSERT IGNORE give idempotent writes.
// For the hard-cap check we rely on INSERT-then-SUM-then-conditional-DELETE.
// Under concurrent requests at budget-1 multiple inserts may land, one or
// more over-commit, and each racing request independently sees
// creditsUsed > budget and rolls back its own row. Worst case we under-allow
// a small number of races, never over-allow (hard cap safety).

function escYearMonth(val: unknown): string {
  const s = String(val ?? "");
  if (!/^\d{4}-\d{2}$/.test(s)) {
    throw new Error("Invalid year_month (expected YYYY-MM)");
  }
  return `'${s}'`;
}

export async function getMonthlyVideoUsage(
  clerkUserId: string,
  yearMonth: string
): Promise<number> {
  const rows = await sql(
    "SELECT COALESCE(SUM(cost), 0) AS c FROM monthly_video_renders " +
      `WHERE clerk_user_id = ${escUuid(clerkUserId)} ` +
      `AND \`year_month\` = ${escYearMonth(yearMonth)}`
  );
  const n = Number(rows[0]?.c ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export async function hasMonthlyVideoRender(
  clerkUserId: string,
  yearMonth: string,
  videoId: string
): Promise<boolean> {
  const rows = await sql(
    "SELECT 1 FROM monthly_video_renders " +
      `WHERE clerk_user_id = ${escUuid(clerkUserId)} ` +
      `AND \`year_month\` = ${escYearMonth(yearMonth)} ` +
      `AND video_id = ${escUuid(videoId)} LIMIT 1`
  );
  return rows.length > 0;
}

/**
 * Attempt to add a render row consuming `cost` credits, capped at
 * `creditBudget` total credits for (user, month).
 * - INSERT IGNORE handles idempotency: duplicate (user, month, video) is a no-op.
 * - After insert, SUM(cost) across the month. If over budget, DELETE the row
 *   we just inserted and return atCap=true.
 * - Races under concurrency: every racing request sees creditsUsed > budget
 *   after its own insert and deletes its own row. Under-allows under
 *   contention, never over-allows — preserves the hard-cap guarantee.
 */
export async function addMonthlyVideoRender(
  clerkUserId: string,
  yearMonth: string,
  videoId: string,
  cost: number,
  creditBudget: number
): Promise<{ added: boolean; count: number; atCap: boolean }> {
  if (!Number.isFinite(cost) || cost < 0) {
    throw new Error("Invalid render cost");
  }

  const existed = await hasMonthlyVideoRender(clerkUserId, yearMonth, videoId);

  if (!existed) {
    await sqlInsert(
      "INSERT IGNORE INTO monthly_video_renders " +
        "(clerk_user_id, `year_month`, video_id, cost, created_at) VALUES (" +
        `${escUuid(clerkUserId)}, ${escYearMonth(yearMonth)}, ` +
        `${escUuid(videoId)}, ${escInt(cost)}, ${escString(nowSql())})`
    );
  }

  const creditsUsed = await getMonthlyVideoUsage(clerkUserId, yearMonth);

  if (!existed && creditsUsed > creditBudget) {
    await sql(
      "DELETE FROM monthly_video_renders " +
        `WHERE clerk_user_id = ${escUuid(clerkUserId)} ` +
        `AND \`year_month\` = ${escYearMonth(yearMonth)} ` +
        `AND video_id = ${escUuid(videoId)}`
    );
    return { added: false, count: creditsUsed - cost, atCap: true };
  }

  return { added: !existed, count: creditsUsed, atCap: false };
}

export async function removeMonthlyVideoRender(
  clerkUserId: string,
  yearMonth: string,
  videoId: string
): Promise<{ removed: boolean; count: number }> {
  const existed = await hasMonthlyVideoRender(clerkUserId, yearMonth, videoId);
  if (!existed) {
    const creditsUsed = await getMonthlyVideoUsage(clerkUserId, yearMonth);
    return { removed: false, count: creditsUsed };
  }
  await sql(
    "DELETE FROM monthly_video_renders " +
      `WHERE clerk_user_id = ${escUuid(clerkUserId)} ` +
      `AND \`year_month\` = ${escYearMonth(yearMonth)} ` +
      `AND video_id = ${escUuid(videoId)}`
  );
  const count = await getMonthlyVideoUsage(clerkUserId, yearMonth);
  return { removed: true, count };
}

// ─── Series ───────────────────────────────────────────────────────────────────
//
// Stored in table `series` with columns matching the Series type. Collection
// fields (`platforms`, `videos`) live as JSON strings. On a missing-table
// failure (migration pending), each function logs and returns a safe empty
// fallback — mirrors the webhooks pattern above. New sites should assume
// graceful degradation, not hard failure.

const SERIES_MODES: readonly SeriesMode[] = [
  "faceless",
  "stock-ai-avatar",
  "heygen-avatar",
  "combo",
];
const SERIES_STATUSES: readonly SeriesStatus[] = ["active", "paused", "completed"];
const HEYGEN_SOURCES: readonly HeygenAvatarSource[] = ["licensed", "twin"];
const POSTING_FREQUENCIES: readonly PostingFrequency[] = [
  "daily",
  "3x-week",
  "5x-week",
  "custom",
];

function rowToSeries(row: NcbRow): Series {
  const parseJson = <T>(val: unknown, fallback: T): T => {
    if (typeof val !== "string") return fallback;
    try {
      return JSON.parse(val) as T;
    } catch {
      return fallback;
    }
  };
  return {
    id: String(row.id),
    userId: String(row.user_id),
    name: String(row.name),
    topic: String(row.topic),
    contentType: row.content_type as Series["contentType"],
    facelessStyle: row.faceless_style as Series["facelessStyle"],
    tone: (row.tone as Series["tone"]) ?? undefined,
    frequency: row.frequency as PostingFrequency,
    platforms: parseJson<Series["platforms"]>(row.platforms, []),
    mode: row.mode as SeriesMode,
    heygenAvatarSource:
      (row.heygen_avatar_source as HeygenAvatarSource | null) ?? undefined,
    stockAvatarId: (row.stock_avatar_id as string | null) ?? undefined,
    heygenLicensedAvatarId:
      (row.heygen_licensed_avatar_id as string | null) ?? undefined,
    voiceId: (row.voice_id as string | null) ?? undefined,
    status: row.status as SeriesStatus,
    startDate: String(row.start_date),
    nextVideoAt: (row.next_video_at as string | null) ?? undefined,
    videos: parseJson<Series["videos"]>(row.videos, []),
    creditsConsumed:
      row.credits_consumed === null || row.credits_consumed === undefined
        ? 0
        : Number(row.credits_consumed),
    createdAt: String(row.created_at),
  };
}

export async function listSeriesForUser(userId: string): Promise<Series[]> {
  try {
    const rows = await sql(
      `SELECT * FROM series WHERE user_id = ${escUuid(userId)} ORDER BY created_at DESC`
    );
    return rows.map(rowToSeries);
  } catch (err) {
    console.warn("[series] listSeriesForUser failed (migration pending?):", err);
    return [];
  }
}

/** Cron-only: every active series across all users, for the scheduler. */
export async function listActiveSeries(): Promise<Series[]> {
  try {
    const rows = await sql(
      `SELECT * FROM series WHERE status = ${escString("active")} ORDER BY created_at ASC`
    );
    return rows.map(rowToSeries);
  } catch (err) {
    console.warn("[series] listActiveSeries failed:", err);
    return [];
  }
}

export async function getSeriesById(seriesId: string): Promise<Series | null> {
  try {
    const rows = await sql(
      `SELECT * FROM series WHERE id = ${escUuid(seriesId)} LIMIT 1`
    );
    return rows.length > 0 ? rowToSeries(rows[0]) : null;
  } catch (err) {
    console.warn("[series] getSeriesById failed:", err);
    return null;
  }
}

export async function createSeries(
  userId: string,
  data: CreateSeriesInput
): Promise<Series> {
  const id = `srs_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = new Date().toISOString();
  const record: Series = {
    id,
    userId,
    name: data.name,
    topic: data.topic,
    contentType: data.contentType,
    facelessStyle: data.facelessStyle,
    frequency: data.frequency,
    platforms: [...data.platforms],
    mode: data.mode,
    heygenAvatarSource: data.heygenAvatarSource,
    stockAvatarId: data.stockAvatarId,
    heygenLicensedAvatarId: data.heygenLicensedAvatarId,
    voiceId: data.voiceId,
    status: "active",
    startDate: data.startDate,
    videos: [],
    creditsConsumed: 0,
    createdAt,
  };
  try {
    await sqlInsert(
      `INSERT INTO series (
        id, user_id, name, topic, content_type, faceless_style, frequency,
        platforms, mode, heygen_avatar_source, stock_avatar_id,
        heygen_licensed_avatar_id, voice_id, status, start_date, videos,
        credits_consumed, created_at
       ) VALUES (
        ${escUuid(id)},
        ${escUuid(userId)},
        ${escString(data.name)},
        ${escString(data.topic)},
        ${escString(data.contentType)},
        ${escString(data.facelessStyle)},
        ${escEnum(data.frequency, POSTING_FREQUENCIES)},
        ${escString(JSON.stringify(data.platforms))},
        ${escEnum(data.mode, SERIES_MODES)},
        ${data.heygenAvatarSource ? escEnum(data.heygenAvatarSource, HEYGEN_SOURCES) : "NULL"},
        ${data.stockAvatarId ? escString(data.stockAvatarId) : "NULL"},
        ${data.heygenLicensedAvatarId ? escString(data.heygenLicensedAvatarId) : "NULL"},
        ${data.voiceId ? escString(data.voiceId) : "NULL"},
        ${escEnum("active", SERIES_STATUSES)},
        ${escString(data.startDate)},
        ${escString("[]")},
        0,
        ${escString(nowSql())}
       )`
    );
  } catch (err) {
    console.warn("[series] createSeries insert failed:", err);
  }
  return record;
}

export async function updateSeries(
  seriesId: string,
  patch: Partial<Series>
): Promise<Series | null> {
  const existing = await getSeriesById(seriesId);
  if (!existing) return null;

  const set: string[] = [];
  if (patch.name !== undefined) set.push(`name = ${escString(patch.name)}`);
  if (patch.topic !== undefined) set.push(`topic = ${escString(patch.topic)}`);
  if (patch.mode !== undefined) set.push(`mode = ${escEnum(patch.mode, SERIES_MODES)}`);
  if (patch.status !== undefined)
    set.push(`status = ${escEnum(patch.status, SERIES_STATUSES)}`);
  if (patch.frequency !== undefined)
    set.push(`frequency = ${escEnum(patch.frequency, POSTING_FREQUENCIES)}`);
  if (patch.platforms !== undefined)
    set.push(`platforms = ${escString(JSON.stringify(patch.platforms))}`);
  if (patch.videos !== undefined)
    set.push(`videos = ${escString(JSON.stringify(patch.videos))}`);
  if (patch.heygenAvatarSource !== undefined)
    set.push(
      `heygen_avatar_source = ${patch.heygenAvatarSource ? escEnum(patch.heygenAvatarSource, HEYGEN_SOURCES) : "NULL"}`
    );
  if (patch.stockAvatarId !== undefined)
    set.push(
      `stock_avatar_id = ${patch.stockAvatarId ? escString(patch.stockAvatarId) : "NULL"}`
    );
  if (patch.heygenLicensedAvatarId !== undefined)
    set.push(
      `heygen_licensed_avatar_id = ${patch.heygenLicensedAvatarId ? escString(patch.heygenLicensedAvatarId) : "NULL"}`
    );
  if (patch.voiceId !== undefined)
    set.push(`voice_id = ${patch.voiceId ? escString(patch.voiceId) : "NULL"}`);
  if (patch.nextVideoAt !== undefined)
    set.push(`next_video_at = ${patch.nextVideoAt ? escString(patch.nextVideoAt) : "NULL"}`);
  if (patch.creditsConsumed !== undefined)
    set.push(`credits_consumed = ${escInt(patch.creditsConsumed)}`);

  if (set.length === 0) return existing;

  try {
    await sql(`UPDATE series SET ${set.join(", ")} WHERE id = ${escUuid(seriesId)}`);
  } catch (err) {
    console.warn("[series] updateSeries failed:", err);
  }
  return getSeriesById(seriesId);
}

export async function deleteSeries(seriesId: string): Promise<boolean> {
  try {
    await sql(`DELETE FROM series WHERE id = ${escUuid(seriesId)}`);
    return true;
  } catch (err) {
    console.warn("[series] deleteSeries failed:", err);
    return false;
  }
}
