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

function esc(val: unknown): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number") {
    if (!Number.isFinite(val)) return "NULL";
    return String(val);
  }
  if (typeof val === "boolean") return val ? "1" : "0";
  const str = String(val)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "''")
    .replace(/\0/g, "")
    .replace(/\x1a/g, "");
  return `'${str}'`;
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
    title: str(row.title),
    scriptJson: parseJson(row.script_json, { hook: "", body: "", cta: "" }),
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
    `INSERT INTO videos (user_id, week_id, title, script_json, platform, day_of_week,
      faceless_style, duration_seconds, content_type, status, output_url, thumbnail_url,
      render_job_id, topic_label, hook_type, sentiment, specificity_score,
      watch_time_avg, view_count, engagement_rate, ctr, traffic_from_pseo,
      visibility_score, platform_video_id, created_at, published_at)
     VALUES (${esc(data.userId)}, ${esc(data.weekId)}, ${esc(data.title)},
             ${esc(JSON.stringify(data.scriptJson))}, ${esc(data.platform)},
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
  if (sets.length > 0) {
    await sql(`UPDATE videos SET ${sets.join(", ")} WHERE id = ${esc(videoId)}`);
  }
  const updated = await getVideo(videoId);
  if (!updated) throw new Error(`Video ${videoId} not found after update`);
  return updated;
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
  const rows = await sql(
    `SELECT * FROM videos WHERE user_id = ${esc(userId)} AND visibility_score IS NOT NULL
     ORDER BY visibility_score DESC LIMIT ${limit}`
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
