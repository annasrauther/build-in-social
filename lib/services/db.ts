/**
 * Database service — auto-switches between NoCodeBackend (real) and in-memory mock.
 * When NOCODEBACKEND_SECRET_KEY is set → uses real NCB MCP API.
 * When absent → falls back to in-memory mock store (same pattern as claude.ts, r2.ts, etc.)
 */

import * as real from "@/lib/services/db.real";
import * as mock from "@/lib/mock/nocodebackend.mock";

const useReal = !!process.env.NOCODEBACKEND_SECRET_KEY;

// ── User ──
export const getUser = useReal ? real.getUser : mock.getUser;
export const getUserByClerkId = useReal ? real.getUserByClerkId : mock.getUserByClerkId;
export const createUser = useReal ? real.createUser : mock.createUser;
export const updateUser = useReal ? real.updateUser : mock.updateUser;

// ── VoiceProfile ──
export const getVoiceProfile = useReal ? real.getVoiceProfile : mock.getVoiceProfile;
export const getVoiceProfilesForUser = useReal ? real.getVoiceProfilesForUser : mock.getVoiceProfilesForUser;
export const createVoiceProfile = useReal ? real.createVoiceProfile : mock.createVoiceProfile;

// ── ContentWeek ──
export const getCurrentWeek = useReal ? real.getCurrentWeek : mock.getCurrentWeek;
export const getWeekById = useReal ? real.getWeekById : mock.getWeekById;
export const createContentWeek = useReal ? real.createContentWeek : mock.createContentWeek;
export const updateWeekStatus = useReal ? real.updateWeekStatus : mock.updateWeekStatus;

// ── Videos ──
export const getVideosForWeek = useReal ? real.getVideosForWeek : mock.getVideosForWeek;
export const getVideo = useReal ? real.getVideo : mock.getVideo;
export const getVideos = useReal ? real.getVideos : mock.getVideos;
export const createVideo = useReal ? real.createVideo : mock.createVideo;
export const updateVideo = useReal ? real.updateVideo : mock.updateVideo;
export const updateVideoScript = useReal ? real.updateVideoScript : mock.updateVideoScript;
export const updateVideoSchedule = useReal ? real.updateVideoSchedule : mock.updateVideoSchedule;
export const approveVideo = useReal ? real.approveVideo : mock.approveVideo;
export const approveAllForWeek = useReal ? real.approveAllForWeek : mock.approveAllForWeek;
export const getTopPerformingVideos = useReal ? real.getTopPerformingVideos : mock.getTopPerformingVideos;

// ── RenderJobs ──
export const getRenderJob = useReal ? real.getRenderJob : mock.getRenderJob;
export const createRenderJob = useReal ? real.createRenderJob : mock.createRenderJob;
export const updateRenderJob = useReal ? real.updateRenderJob : mock.updateRenderJob;

// ── pSEO ──
export const getPseoPage = useReal ? real.getPseoPage : mock.getPseoPage;
export const getPseoPageByVideoId = useReal ? real.getPseoPageByVideoId : mock.getPseoPageByVideoId;
export const createPseoPage = useReal ? real.createPseoPage : mock.createPseoPage;

// ── Stripe webhook idempotency (critical path #2) ──
export const recordStripeEvent = useReal ? real.recordStripeEvent : mock.recordStripeEvent;

// ── Voice clone consent (critical path #7) ──
export const recordVoiceConsent = useReal ? real.recordVoiceConsent : mock.recordVoiceConsent;
export const hasVoiceConsent = useReal ? real.hasVoiceConsent : mock.hasVoiceConsent;

// ── Avatar waitlist (Phase 2 lead capture) ──
export const addToAvatarWaitlist = useReal ? real.addToAvatarWaitlist : mock.addToAvatarWaitlist;

// ── Webhook subscriptions ──
export const listWebhookSubscriptions = useReal
  ? real.listWebhookSubscriptions
  : mock.listWebhookSubscriptions;
export const getWebhookSubscription = useReal
  ? real.getWebhookSubscription
  : mock.getWebhookSubscription;
export const createWebhookSubscription = useReal
  ? real.createWebhookSubscription
  : mock.createWebhookSubscription;
export const updateWebhookSubscription = useReal
  ? real.updateWebhookSubscription
  : mock.updateWebhookSubscription;
export const deleteWebhookSubscription = useReal
  ? real.deleteWebhookSubscription
  : mock.deleteWebhookSubscription;
export const findWebhookSubscriptionsForEvent = useReal
  ? real.findWebhookSubscriptionsForEvent
  : mock.findWebhookSubscriptionsForEvent;

// ── GDPR: cascade delete + export (Article 17 + 20) ──
export const getAllUserData = useReal ? real.getAllUserData : mock.getAllUserData;
export const deleteUserAndData = useReal ? real.deleteUserAndData : mock.deleteUserAndData;
