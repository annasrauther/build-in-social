/**
 * Mock NoCodeBackend — in-memory store with seed data
 * Auto-used when NOCODEBACKEND_SECRET_KEY is not set.
 */

import type { User, VoiceProfile } from "@/lib/types/user";
import type { Video, RenderJob, ContentWeek } from "@/lib/types/video";
import type { PseoPage } from "@/lib/types/pseo";
import type { Series, CreateSeriesInput } from "@/lib/types/series";

const MOCK_DELAY_MS = 200;
const delay = (ms = MOCK_DELAY_MS) => new Promise((r) => setTimeout(r, ms));

const MOCK_USER_ID = "user_mock_01";
const MOCK_WEEK_ID = "week_mock_01";

// ─── Seed Data ────────────────────────────────────────────────────────────────

const seedUser: User = {
  id: MOCK_USER_ID,
  clerkUserId: "clerk_mock_01",
  email: "alex@buildinsocial.com",
  displayName: "Alex Founder",
  brandName: "Build In Social",
  niche: "Indie SaaS tools for developers",
  tone: "nerdy-warm",
  platforms: ["youtube", "instagram", "linkedin", "x"],
  onboardingComplete: true,
  subscriptionTier: "creator",
  trialStartedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
};

const seedWeek: ContentWeek = {
  id: MOCK_WEEK_ID,
  userId: MOCK_USER_ID,
  weekNumber: 15,
  year: 2026,
  startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  mode: "manual",
  contentSource: "user_input",
  qualityGateAnswers: [
    "I shipped the onboarding quality gate this week — 3 questions that filter vague prompts and return a specificity score. Tested with 12 real founders.",
    "The biggest challenge was getting Claude Haiku to output consistent JSON scores without drifting. Fixed with stricter tool schema.",
    "The outcome: 80% of users who filled it out got a plan generated in under 2 minutes. That's the metric I care about.",
  ],
  specificityScore: 8,
  status: "ready",
  videoCount: 23,
  createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
};

const seedVideos: Video[] = [
  {
    id: "video_01",
    userId: MOCK_USER_ID,
    weekId: MOCK_WEEK_ID,
    title: "Why I shipped a quality gate before letting anyone post",
    scriptJson: {
      hook: "I blocked my own users from creating content. Here's why that was the best product decision I've made.",
      body: "Content without context is noise. Before Build In Social generates a single video, it asks you 3 specific questions. Not 'what's your niche' — but 'what did you ship this week, what was hard, what was the outcome'. If you answer vaguely, it pushes back. The result: every video we generate is rooted in something real that happened.",
      cta: "Save this if you're building a content tool. The quality gate is the product.",
    },
    platform: "youtube",
    dayOfWeek: "mon",
    facelessStyle: "dev-log",
    durationSeconds: 38,
    contentType: "feature-drop",
    status: "approved",
    topicLabel: "feature_drop",
    hookType: "unexpected_twist",
    sentiment: "confident",
    viewCount: 1847,
    watchTimeAvg: 32,
    engagementRate: 0.082,
    visibilityScore: 0.71,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "video_02",
    userId: MOCK_USER_ID,
    weekId: MOCK_WEEK_ID,
    title: "The Claude Haiku prompt that generates 23 videos in 90 seconds",
    scriptJson: {
      hook: "23 platform-native videos. 90 seconds. One prompt. Here's the architecture.",
      body: "Most AI content tools give you one generic output you then reformat manually. Build In Social runs a single structured prompt that splits output by platform — YouTube gets a 38-second dev-log, LinkedIn gets a 52-second case study framing, X gets an 18-second punchy take. Each one is different. Each one matches what that algorithm rewards.",
      cta: "Follow for more build-in-public posts about what's actually working.",
    },
    platform: "linkedin",
    dayOfWeek: "mon",
    facelessStyle: "slide",
    durationSeconds: 52,
    contentType: "tutorial",
    status: "draft",
    topicLabel: "how_to",
    hookType: "shock_stat",
    sentiment: "educational",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "video_03",
    userId: MOCK_USER_ID,
    weekId: MOCK_WEEK_ID,
    title: "Hot take: most content advice is wrong for developers",
    scriptJson: {
      hook: "Every content coach tells developers to 'be consistent'. They're missing the actual variable.",
      body: "Consistency is a lagging indicator. The leading indicator is specificity. A developer who posts vaguely about 'building a SaaS' gets ignored. The same developer who posts 'I shipped a quality gate this week — here's the Claude prompt that makes it work' gets saved, shared, and followed. The platform doesn't care about frequency. It cares about specificity x relevance.",
      cta: "Does this match your experience? Comment with what actually moved your numbers.",
    },
    platform: "x",
    dayOfWeek: "tue",
    facelessStyle: "minimal-text",
    durationSeconds: 18,
    contentType: "founder-story",
    status: "rendering",
    topicLabel: "opinion",
    hookType: "bold_claim",
    sentiment: "confident",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "video_04",
    userId: MOCK_USER_ID,
    weekId: MOCK_WEEK_ID,
    title: "How I validate content ideas before building the feature",
    scriptJson: {
      hook: "Before I build anything, I ship a post about building it.",
      body: "Every feature in Build In Social started as a piece of content. I post the idea, watch the comments, see what resonates. If nobody saves it or asks 'how do I get this', I don't build it. It's a free customer interview that also grows your audience. The content IS the validation.",
      cta: "What are you building right now? Drop it in the comments. I'll tell you the hook.",
    },
    platform: "instagram",
    dayOfWeek: "tue",
    facelessStyle: "documentary",
    durationSeconds: 25,
    contentType: "founder-story",
    status: "ready",
    outputUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
    topicLabel: "mistake_story",
    hookType: "results_preview",
    sentiment: "educational",
    viewCount: 892,
    watchTimeAvg: 22,
    engagementRate: 0.094,
    visibilityScore: 0.68,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const seedRenderJob: RenderJob = {
  id: "job_01",
  userId: MOCK_USER_ID,
  videoId: "video_03",
  status: "rendering",
  createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
};

const seedPseoPages: PseoPage[] = [
  {
    id: "pseo_01",
    userId: MOCK_USER_ID,
    videoId: "video_01",
    title: "Why I shipped a quality gate before letting anyone post",
    slug: "quality-gate-before-posting",
    htmlContent: `<!DOCTYPE html><html><head><title>Quality Gate | Build In Social</title></head><body><h1>Why I shipped a quality gate</h1></body></html>`,
    metaDescription: "I blocked my own users from creating content. Here's why that was the best product decision I've made.",
    canonicalUrl: "https://buildinsocial.com/p/quality-gate-before-posting",
    indexed: true,
    indexedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    viewCount: 312,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ─── In-memory store ──────────────────────────────────────────────────────────

const store = {
  users: new Map<string, User>([[MOCK_USER_ID, seedUser]]),
  voiceProfiles: new Map<string, VoiceProfile>(),
  weeks: new Map<string, ContentWeek>([[MOCK_WEEK_ID, seedWeek]]),
  videos: new Map<string, Video>(seedVideos.map((v) => [v.id, v])),
  renderJobs: new Map<string, RenderJob>([[seedRenderJob.id, seedRenderJob]]),
  pseoPages: new Map<string, PseoPage>(seedPseoPages.map((p) => [p.id, p])),
};

export const MOCK_USER_ID_EXPORT = MOCK_USER_ID;

// ─── User ─────────────────────────────────────────────────────────────────────

export async function getUser(userId: string): Promise<User | null> {
  await delay();
  return store.users.get(userId) ?? null;
}

export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  await delay();
  for (const user of store.users.values()) {
    if (user.clerkUserId === clerkId) return user;
  }
  return null;
}

export async function getMockCurrentUser(): Promise<User> {
  await delay();
  return seedUser;
}

export async function createUser(data: Omit<User, "id" | "createdAt">): Promise<User> {
  await delay();
  const user: User = { ...data, id: `user_${Date.now()}`, createdAt: new Date().toISOString() };
  store.users.set(user.id, user);
  return user;
}

export async function updateUser(userId: string, data: Partial<User>): Promise<User> {
  await delay();
  const existing = store.users.get(userId) ?? seedUser;
  const updated = { ...existing, ...data };
  store.users.set(userId, updated);
  return updated;
}

// ─── VoiceProfile ─────────────────────────────────────────────────────────────

export async function getVoiceProfile(profileId: string): Promise<VoiceProfile | null> {
  await delay();
  return store.voiceProfiles.get(profileId) ?? null;
}

export async function getVoiceProfilesForUser(userId: string): Promise<VoiceProfile[]> {
  await delay();
  return Array.from(store.voiceProfiles.values()).filter((v) => v.userId === userId);
}

export async function createVoiceProfile(data: Omit<VoiceProfile, "id" | "createdAt">): Promise<VoiceProfile> {
  await delay();
  const profile: VoiceProfile = { ...data, id: `voice_${Date.now()}`, createdAt: new Date().toISOString() };
  store.voiceProfiles.set(profile.id, profile);
  return profile;
}

export async function deleteVoiceProfilesForUser(userId: string): Promise<void> {
  await delay();
  for (const [id, vp] of store.voiceProfiles) {
    if (vp.userId === userId) store.voiceProfiles.delete(id);
  }
  // Clear pointer on the user row so render pipeline falls back to library.
  for (const [uid, user] of store.users) {
    if (user.clerkUserId === userId || uid === userId) {
      store.users.set(uid, { ...user, voiceProfileId: undefined });
    }
  }
}

// ─── ContentWeek ──────────────────────────────────────────────────────────────

export async function getCurrentWeek(userId: string): Promise<ContentWeek | null> {
  await delay();
  const weeks = Array.from(store.weeks.values())
    .filter((w) => w.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return weeks[0] ?? null;
}

export async function getWeekById(weekId: string): Promise<ContentWeek | null> {
  await delay();
  return store.weeks.get(weekId) ?? null;
}

export async function createContentWeek(data: Omit<ContentWeek, "id" | "createdAt">): Promise<ContentWeek> {
  await delay();
  const week: ContentWeek = { ...data, id: `week_${Date.now()}`, createdAt: new Date().toISOString() };
  store.weeks.set(week.id, week);
  return week;
}

export async function updateWeekStatus(weekId: string, status: ContentWeek["status"]): Promise<void> {
  await delay(100);
  const existing = store.weeks.get(weekId);
  if (existing) store.weeks.set(weekId, { ...existing, status });
}

// ─── Videos ───────────────────────────────────────────────────────────────────

export async function getVideosForWeek(weekId: string): Promise<Video[]> {
  await delay();
  return Array.from(store.videos.values()).filter((v) => v.weekId === weekId);
}

export async function getVideo(videoId: string): Promise<Video | null> {
  await delay();
  return store.videos.get(videoId) ?? null;
}

export async function getVideos(userId: string): Promise<Video[]> {
  await delay();
  return Array.from(store.videos.values())
    .filter((v) => v.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createVideo(data: Omit<Video, "id" | "createdAt">): Promise<Video> {
  await delay();
  const video: Video = { ...data, id: `video_${Date.now()}`, createdAt: new Date().toISOString() };
  store.videos.set(video.id, video);
  return video;
}

export async function updateVideo(videoId: string, data: Partial<Video>): Promise<Video> {
  await delay(100);
  const existing = store.videos.get(videoId);
  if (!existing) throw new Error(`Video ${videoId} not found`);
  const updated = { ...existing, ...data };
  store.videos.set(videoId, updated);
  return updated;
}

export async function updateVideoSchedule(
  videoId: string,
  day: string,
  time?: string
): Promise<void> {
  await delay(80);
  const existing = store.videos.get(videoId);
  if (!existing) throw new Error(`Video ${videoId} not found`);
  // Store scheduled_day as a custom property via type cast
  const updated = { ...existing, scheduledDay: day, scheduledTime: time };
  store.videos.set(videoId, updated as Video);
}

export async function updateVideoScript(videoId: string, script: string): Promise<void> {
  await delay(100);
  const existing = store.videos.get(videoId);
  if (!existing) throw new Error(`Video ${videoId} not found`);
  const updatedScript = { ...existing.scriptJson, body: script };
  store.videos.set(videoId, { ...existing, scriptJson: updatedScript });
}

export async function approveVideo(videoId: string): Promise<Video> {
  return updateVideo(videoId, { status: "approved" });
}

export async function approveAllForWeek(weekId: string): Promise<void> {
  await delay(100);
  for (const [id, video] of store.videos.entries()) {
    if (video.weekId === weekId && video.status === "draft") {
      store.videos.set(id, { ...video, status: "approved" });
    }
  }
}

export async function getTopPerformingVideos(userId: string, limit = 10): Promise<Video[]> {
  await delay();
  return Array.from(store.videos.values())
    .filter((v) => v.userId === userId && v.visibilityScore !== undefined)
    .sort((a, b) => (b.visibilityScore ?? 0) - (a.visibilityScore ?? 0))
    .slice(0, limit);
}

// ─── RenderJobs ───────────────────────────────────────────────────────────────

export async function getRenderJob(jobId: string): Promise<RenderJob | null> {
  await delay(100);
  return store.renderJobs.get(jobId) ?? null;
}

export async function createRenderJob(data: Omit<RenderJob, "id" | "createdAt">): Promise<RenderJob> {
  await delay();
  const job: RenderJob = { ...data, id: `job_${Date.now()}`, createdAt: new Date().toISOString() };
  store.renderJobs.set(job.id, job);
  return job;
}

export async function updateRenderJob(jobId: string, data: Partial<RenderJob>): Promise<RenderJob> {
  await delay(100);
  const existing = store.renderJobs.get(jobId);
  if (!existing) throw new Error(`RenderJob ${jobId} not found`);
  const updated = { ...existing, ...data };
  store.renderJobs.set(jobId, updated);
  return updated;
}

// ─── pSEO ─────────────────────────────────────────────────────────────────────

export async function getPseoPage(slug: string): Promise<PseoPage | null> {
  await delay();
  for (const page of store.pseoPages.values()) {
    if (page.slug === slug) return page;
  }
  return null;
}

export async function getPseoPageByVideoId(videoId: string): Promise<PseoPage | null> {
  await delay(100);
  for (const page of store.pseoPages.values()) {
    if (page.videoId === videoId) return page;
  }
  return null;
}

export async function createPseoPage(
  data: Omit<PseoPage, "id" | "createdAt" | "indexed" | "viewCount">
): Promise<PseoPage> {
  await delay();
  const page: PseoPage = { ...data, id: `pseo_${Date.now()}`, indexed: false, viewCount: 0, createdAt: new Date().toISOString() };
  store.pseoPages.set(page.id, page);
  return page;
}

// ─── Stripe webhook idempotency (critical path #2) ────────────────────────────

const processedStripeEvents = new Set<string>();

/**
 * Insert-once: returns true if this is the first time we've seen `eventId`,
 * false if it was already processed. Mock uses a Set; real uses a UNIQUE
 * constraint on the processed_stripe_events table.
 */
export async function recordStripeEvent(eventId: string): Promise<boolean> {
  await delay(20);
  if (processedStripeEvents.has(eventId)) return false;
  processedStripeEvents.add(eventId);
  return true;
}

// ─── Voice clone consent (critical path #7) ───────────────────────────────────

interface VoiceConsentRecord {
  userId: string;
  consentedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

const voiceConsents = new Map<string, VoiceConsentRecord>();

/**
 * Persist explicit consent for biometric voice cloning. MUST be called BEFORE
 * any ElevenLabs cloneVoice request so we can prove consent in disputes.
 * Idempotent: re-recording for the same user updates the timestamp.
 */
export async function recordVoiceConsent(params: {
  userId: string;
  consentedAt: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<VoiceConsentRecord> {
  await delay(50);
  const record: VoiceConsentRecord = {
    userId: params.userId,
    consentedAt: params.consentedAt,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  };
  voiceConsents.set(params.userId, record);
  return record;
}

export async function hasVoiceConsent(userId: string): Promise<boolean> {
  await delay(20);
  return voiceConsents.has(userId);
}

// ─── GDPR: cascade delete + export (Article 17 + 20) ─────────────────────────

export async function getAllUserData(userId: string): Promise<{
  user: User | null;
  voiceProfiles: VoiceProfile[];
  weeks: ContentWeek[];
  videos: Video[];
  pseoPages: PseoPage[];
}> {
  await delay(50);
  return {
    user: store.users.get(userId) ?? null,
    voiceProfiles: Array.from(store.voiceProfiles.values()).filter((v) => v.userId === userId),
    weeks: Array.from(store.weeks.values()).filter((w) => w.userId === userId),
    videos: Array.from(store.videos.values()).filter((v) => v.userId === userId),
    pseoPages: Array.from(store.pseoPages.values()).filter((p) => p.userId === userId),
  };
}

export async function deleteUserAndData(userId: string): Promise<void> {
  await delay(50);
  for (const [id, p] of store.pseoPages.entries()) if (p.userId === userId) store.pseoPages.delete(id);
  for (const [id, j] of store.renderJobs.entries()) if (j.userId === userId) store.renderJobs.delete(id);
  for (const [id, v] of store.videos.entries()) if (v.userId === userId) store.videos.delete(id);
  for (const [id, w] of store.weeks.entries()) if (w.userId === userId) store.weeks.delete(id);
  for (const [id, vp] of store.voiceProfiles.entries()) if (vp.userId === userId) store.voiceProfiles.delete(id);
  voiceConsents.delete(userId);
  store.users.delete(userId);
}

// ─── Avatar waitlist (lead capture for Phase 2) ───────────────────────────────

interface WaitlistRecord {
  email: string;
  joinedAt: string;
}

const waitlist = new Map<string, WaitlistRecord>();

/**
 * Idempotent insert: returns { added: true, position } on first insert,
 * { added: false, position } on duplicate. Position is 1-indexed.
 */
export async function addToAvatarWaitlist(email: string): Promise<{
  added: boolean;
  position: number;
}> {
  await delay(60);
  const normalized = email.trim().toLowerCase();
  if (waitlist.has(normalized)) {
    const keys = Array.from(waitlist.keys());
    return { added: false, position: keys.indexOf(normalized) + 1 };
  }
  waitlist.set(normalized, {
    email: normalized,
    joinedAt: new Date().toISOString(),
  });
  return { added: true, position: waitlist.size };
}

// ─── Webhook subscriptions ────────────────────────────────────────────────────

import type {
  WebhookSubscription,
  WebhookEventType,
  WebhookStatus,
} from "@/lib/types/webhook";

const webhookSubs = new Map<string, WebhookSubscription>();
let webhookIdCounter = 1;

export async function listWebhookSubscriptions(
  userId: string
): Promise<WebhookSubscription[]> {
  await delay(30);
  return Array.from(webhookSubs.values())
    .filter((w) => w.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getWebhookSubscription(
  id: string
): Promise<WebhookSubscription | null> {
  await delay(20);
  return webhookSubs.get(id) ?? null;
}

export async function createWebhookSubscription(
  data: Omit<WebhookSubscription, "id" | "createdAt">
): Promise<WebhookSubscription> {
  await delay(40);
  const id = `whk_${webhookIdCounter++}`;
  const record: WebhookSubscription = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
  };
  webhookSubs.set(id, record);
  return record;
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
  await delay(20);
  const existing = webhookSubs.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...patch };
  webhookSubs.set(id, updated);
  return updated;
}

export async function deleteWebhookSubscription(id: string): Promise<boolean> {
  await delay(20);
  return webhookSubs.delete(id);
}

export async function findWebhookSubscriptionsForEvent(
  userId: string,
  event: WebhookEventType
): Promise<WebhookSubscription[]> {
  await delay(20);
  return Array.from(webhookSubs.values()).filter(
    (w) =>
      w.userId === userId &&
      w.status !== "disabled" &&
      w.events.includes(event)
  );
}

// Keeps the TS compiler happy when imports reference WebhookStatus implicitly.
export type { WebhookStatus };

// ─── WordPress connections ────────────────────────────────────────────────────
//
// Stubbed collection (`wordpress_connections`) — single record per userId.
// Schema mirrors WordPressConnectionRecord in @/lib/types/wordpress. When the
// real NCB-backed implementation lands in db.real.ts, it should create the
// table and map rows through a similar shape. The mock stores records in
// process memory so dev flows work without a database.

import type { WordPressConnectionRecord } from "@/lib/types/wordpress";

const wordpressConnections = new Map<string, WordPressConnectionRecord>();

export async function getWordPressConnection(
  userId: string
): Promise<WordPressConnectionRecord | null> {
  await delay(30);
  return wordpressConnections.get(userId) ?? null;
}

export async function upsertWordPressConnection(
  data: Omit<WordPressConnectionRecord, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
  }
): Promise<WordPressConnectionRecord> {
  await delay(40);
  const now = new Date().toISOString();
  const existing = wordpressConnections.get(data.userId);
  const record: WordPressConnectionRecord = {
    id: existing?.id ?? data.id ?? `wpc_${Date.now()}`,
    userId: data.userId,
    siteUrl: data.siteUrl,
    username: data.username,
    encryptedAppPassword: data.encryptedAppPassword,
    wpUserId: data.wpUserId,
    lastTestedAt: data.lastTestedAt,
    lastPublishedAt: data.lastPublishedAt,
    enabled: data.enabled,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  wordpressConnections.set(data.userId, record);
  return record;
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
  await delay(30);
  const existing = wordpressConnections.get(userId);
  if (!existing) return null;
  const updated: WordPressConnectionRecord = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  wordpressConnections.set(userId, updated);
  return updated;
}

export async function deleteWordPressConnection(userId: string): Promise<boolean> {
  await delay(20);
  return wordpressConnections.delete(userId);
}

// ─── Monthly video renders (credits) ─────────────────────────────────────────
//
// Mock backing for the hard-cap credits service. Real impl in db.real.ts uses
// `monthly_video_renders` with a unique index on (clerk_user_id, year_month,
// video_id). The mock mirrors that shape so behavior is identical under test.
//
// Call shapes align with credits.ts. The mock keeps a Map of Sets keyed by
// `${clerkUserId}:${yearMonth}`. No cross-process concurrency to worry about.

// Each video render consumes `cost` credits (faceless = 1, HeyGen = 15, etc.
// See lib/credits/costs.ts). `count` in the return shapes is retained with
// its semantic widened to "credits consumed this month" (SUM(cost) not
// COUNT(*)) — call sites don't need to change.
const monthlyVideoRenders = new Map<string, Map<string, number>>();

function monthKey(clerkUserId: string, yearMonth: string): string {
  return `${clerkUserId}:${yearMonth}`;
}

function sumCost(map: Map<string, number> | undefined): number {
  if (!map) return 0;
  let total = 0;
  for (const c of map.values()) total += c;
  return total;
}

export async function getMonthlyVideoUsage(
  clerkUserId: string,
  yearMonth: string
): Promise<number> {
  await delay(20);
  return sumCost(monthlyVideoRenders.get(monthKey(clerkUserId, yearMonth)));
}

export async function hasMonthlyVideoRender(
  clerkUserId: string,
  yearMonth: string,
  videoId: string
): Promise<boolean> {
  await delay(10);
  return monthlyVideoRenders.get(monthKey(clerkUserId, yearMonth))?.has(videoId) ?? false;
}

/**
 * Attempt to add a render for (clerkUserId, yearMonth, videoId), consuming
 * `cost` credits, capped at `creditBudget` total credits for the month.
 *
 * Idempotency: re-calling with the same videoId doesn't re-charge — returns
 * the existing credits-used total and does not overwrite the recorded cost.
 * A deduct+refund+re-deduct cycle will re-insert with the new cost.
 */
export async function addMonthlyVideoRender(
  clerkUserId: string,
  yearMonth: string,
  videoId: string,
  cost: number,
  creditBudget: number
): Promise<{ added: boolean; count: number; atCap: boolean }> {
  await delay(30);
  const k = monthKey(clerkUserId, yearMonth);
  let map = monthlyVideoRenders.get(k);
  if (!map) {
    map = new Map();
    monthlyVideoRenders.set(k, map);
  }
  if (map.has(videoId)) {
    return { added: false, count: sumCost(map), atCap: false };
  }
  const currentTotal = sumCost(map);
  if (currentTotal + cost > creditBudget) {
    return { added: false, count: currentTotal, atCap: true };
  }
  map.set(videoId, cost);
  return { added: true, count: sumCost(map), atCap: false };
}

export async function removeMonthlyVideoRender(
  clerkUserId: string,
  yearMonth: string,
  videoId: string
): Promise<{ removed: boolean; count: number }> {
  await delay(20);
  const k = monthKey(clerkUserId, yearMonth);
  const map = monthlyVideoRenders.get(k);
  if (!map || !map.has(videoId)) {
    return { removed: false, count: sumCost(map) };
  }
  map.delete(videoId);
  return { removed: true, count: sumCost(map) };
}

/** Test-only: clear monthly renders across all users. */
export function _resetMonthlyVideoRenders(): void {
  monthlyVideoRenders.clear();
}

// ─── Series (multi-series per account) ───────────────────────────────────────
//
// Series is the primitive for multi-mode, multi-niche content plans. A user can
// run many in parallel; each has its own mode (faceless / stock-ai-avatar /
// heygen-avatar / combo), cadence, voice, and avatar config. Tests hit these
// directly when `NOCODEBACKEND_SECRET_KEY` is unset. Real impl in db.real.ts
// mirrors this shape against a `series` table.

const seriesStore = new Map<string, Series>();
let seriesIdCounter = 1;

function nextSeriesId(): string {
  return `srs_${Date.now().toString(36)}_${seriesIdCounter++}`;
}

export async function listSeriesForUser(userId: string): Promise<Series[]> {
  await delay(30);
  return Array.from(seriesStore.values())
    .filter((s) => s.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Cron-only: every active series across all users, for the scheduler. */
export async function listActiveSeries(): Promise<Series[]> {
  await delay(30);
  return Array.from(seriesStore.values())
    .filter((s) => s.status === "active")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getSeriesById(seriesId: string): Promise<Series | null> {
  await delay(20);
  return seriesStore.get(seriesId) ?? null;
}

export async function createSeries(
  userId: string,
  data: CreateSeriesInput,
): Promise<Series> {
  await delay(40);
  const id = nextSeriesId();
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
    createdAt: new Date().toISOString(),
  };
  seriesStore.set(id, record);
  return record;
}

export async function updateSeries(
  seriesId: string,
  patch: Partial<Series>,
): Promise<Series | null> {
  await delay(25);
  const existing = seriesStore.get(seriesId);
  if (!existing) return null;
  // Immutable fields stay put.
  const updated: Series = {
    ...existing,
    ...patch,
    id: existing.id,
    userId: existing.userId,
    createdAt: existing.createdAt,
  };
  seriesStore.set(seriesId, updated);
  return updated;
}

export async function deleteSeries(seriesId: string): Promise<boolean> {
  await delay(20);
  return seriesStore.delete(seriesId);
}

/** Test-only: clear series store. */
export function _resetSeries(): void {
  seriesStore.clear();
  seriesIdCounter = 1;
}
