/**
 * Upstash Redis job queue for faceless render jobs.
 * Falls back to an in-memory Map when UPSTASH_REDIS_REST_URL is not set
 * so local development works without any Redis instance.
 */

import {
  UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN,
} from "@/lib/env";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RenderJob {
  id: string;
  videoId: string;
  userId: string;
  status: "queued" | "processing" | "complete" | "failed";
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  outputUrl?: string;
  error?: string;
}

// ─── In-memory fallback ───────────────────────────────────────────────────────

const inMemoryStore = new Map<string, RenderJob>();

// ─── Redis helpers ────────────────────────────────────────────────────────────

async function redisSet(key: string, value: RenderJob): Promise<void> {
  const url = UPSTASH_REDIS_REST_URL!;
  const token = UPSTASH_REDIS_REST_TOKEN ?? "";
  const res = await fetch(`${url}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(JSON.stringify(value)),
  });
  if (!res.ok) throw new Error(`Upstash SET failed: ${res.status}`);
}

async function redisGet(key: string): Promise<RenderJob | null> {
  const url = UPSTASH_REDIS_REST_URL!;
  const token = UPSTASH_REDIS_REST_TOKEN ?? "";
  const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Upstash GET failed: ${res.status}`);
  const json = await res.json() as { result: string | null };
  if (!json.result) return null;
  return JSON.parse(json.result) as RenderJob;
}

async function redisPush(listKey: string, value: string): Promise<void> {
  const url = UPSTASH_REDIS_REST_URL!;
  const token = UPSTASH_REDIS_REST_TOKEN ?? "";
  const res = await fetch(`${url}/rpush/${encodeURIComponent(listKey)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
  });
  if (!res.ok) throw new Error(`Upstash RPUSH failed: ${res.status}`);
}

async function redisPop(listKey: string): Promise<string | null> {
  const url = UPSTASH_REDIS_REST_URL!;
  const token = UPSTASH_REDIS_REST_TOKEN ?? "";
  const res = await fetch(`${url}/lpop/${encodeURIComponent(listKey)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Upstash LPOP failed: ${res.status}`);
  const json = await res.json() as { result: string | null };
  return json.result;
}

// ─── Queue key conventions ────────────────────────────────────────────────────

const JOB_KEY = (id: string) => `render_job:${id}`;
const QUEUE_LIST = "render_queue";

// ─── Public API ───────────────────────────────────────────────────────────────

export async function enqueueRenderJob(
  videoId: string,
  userId: string
): Promise<RenderJob> {
  const job: RenderJob = {
    id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    videoId,
    userId,
    status: "queued",
    createdAt: new Date().toISOString(),
  };

  if (!UPSTASH_REDIS_REST_URL) {
    inMemoryStore.set(job.id, job);
    // In-memory queue — just track insertion order via Map iteration
    console.log("[MOCK queue] enqueueRenderJob", job.id, "video:", videoId);
    return job;
  }

  await redisSet(JOB_KEY(job.id), job);
  await redisPush(QUEUE_LIST, job.id);
  return job;
}

export async function getRenderJob(jobId: string): Promise<RenderJob | null> {
  if (!UPSTASH_REDIS_REST_URL) {
    return inMemoryStore.get(jobId) ?? null;
  }
  return redisGet(JOB_KEY(jobId));
}

export async function updateRenderJob(
  jobId: string,
  updates: Partial<RenderJob>
): Promise<RenderJob> {
  if (!UPSTASH_REDIS_REST_URL) {
    const existing = inMemoryStore.get(jobId);
    if (!existing) throw new Error(`RenderJob ${jobId} not found`);
    const updated: RenderJob = { ...existing, ...updates, id: jobId };
    inMemoryStore.set(jobId, updated);
    return updated;
  }

  const existing = await redisGet(JOB_KEY(jobId));
  if (!existing) throw new Error(`RenderJob ${jobId} not found`);
  const updated: RenderJob = { ...existing, ...updates, id: jobId };
  await redisSet(JOB_KEY(jobId), updated);
  return updated;
}

/**
 * processNextJob — called by a worker/cron endpoint.
 * Dequeues the next job ID and sets its status to "processing".
 * The caller is responsible for executing the actual render and calling
 * updateRenderJob with status "complete" or "failed" afterwards.
 */
export async function processNextJob(): Promise<void> {
  if (!UPSTASH_REDIS_REST_URL) {
    // In-memory: find first queued job
    for (const [id, job] of inMemoryStore) {
      if (job.status === "queued") {
        inMemoryStore.set(id, {
          ...job,
          status: "processing",
          startedAt: new Date().toISOString(),
        });
        console.log("[MOCK queue] processNextJob — picked up", id);
        return;
      }
    }
    console.log("[MOCK queue] processNextJob — queue empty");
    return;
  }

  const jobId = await redisPop(QUEUE_LIST);
  if (!jobId) return; // queue is empty

  const job = await redisGet(JOB_KEY(jobId));
  if (!job) return; // job was removed externally

  await redisSet(JOB_KEY(jobId), {
    ...job,
    status: "processing",
    startedAt: new Date().toISOString(),
  });
}
