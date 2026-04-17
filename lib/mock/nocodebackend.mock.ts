/**
 * Mock NoCodeBackend — in-memory store with seed data
 * Auto-used when NOCODEBACKEND_SECRET_KEY is not set.
 */

import type { User, VoiceProfile } from "@/lib/types/user";
import type { Video, RenderJob, ContentWeek } from "@/lib/types/video";
import type { PseoPage } from "@/lib/types/pseo";

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
