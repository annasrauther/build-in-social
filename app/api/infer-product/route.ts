import { NextResponse } from "next/server";
import { z } from "zod";
import type { InferProductResponse } from "@/lib/types/infer-product";
import { checkRateLimit } from "@/lib/services/rate-limit";

/* -------------------------------------------------------------------------- */
/*  Input validation                                                           */
/* -------------------------------------------------------------------------- */

const InputSchema = z.object({
  input: z
    .string()
    .trim()
    .min(1, "Input is required")
    .max(500, "Input must be 500 characters or fewer"),
});

/* -------------------------------------------------------------------------- */
/*  HTML helpers                                                               */
/* -------------------------------------------------------------------------- */

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&nbsp;/g, " ");
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max);
}

function extractMeta(html: string) {
  // og:title
  const ogTitleMatch = html.match(
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i
  ) ??
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i
    );

  // og:description
  const ogDescMatch = html.match(
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i
  ) ??
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i
    );

  // meta description fallback
  const metaDescMatch = html.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
  ) ??
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i
    );

  // <title> fallback
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);

  // og:image
  const ogImageMatch = html.match(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
  ) ??
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
    );

  // og:site_name
  const ogSiteNameMatch = html.match(
    /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i
  ) ??
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i
    );

  const ogTitle = ogTitleMatch ? decodeEntities(truncate(ogTitleMatch[1].trim(), 300)) : null;
  const ogDesc = ogDescMatch ? decodeEntities(truncate(ogDescMatch[1].trim(), 300)) : null;
  const metaDesc = metaDescMatch ? decodeEntities(truncate(metaDescMatch[1].trim(), 300)) : null;
  const titleTag = titleMatch ? decodeEntities(truncate(titleMatch[1].trim(), 300)) : null;
  const ogImage = ogImageMatch ? decodeEntities(ogImageMatch[1].trim()) : null;
  const ogSiteName = ogSiteNameMatch ? decodeEntities(ogSiteNameMatch[1].trim()) : null;

  return { ogTitle, ogDesc, metaDesc, titleTag, ogImage, ogSiteName };
}

function toOneSentence(str: string): string {
  // Take everything up to the first sentence-ending punctuation
  const match = str.match(/^[^.!?]+[.!?]/);
  return match ? match[0].trim() : str.trim();
}

/* -------------------------------------------------------------------------- */
/*  URL inference                                                              */
/* -------------------------------------------------------------------------- */

function isPrivateUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const hostname = parsed.hostname.toLowerCase();
    // Block private/internal IPs and hostnames
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") return true;
    if (hostname === "0.0.0.0" || hostname.endsWith(".local")) return true;
    if (hostname === "metadata.google.internal") return true;
    // Block private IP ranges
    const parts = hostname.split(".").map(Number);
    if (parts.length === 4 && parts.every((n) => !isNaN(n))) {
      if (parts[0] === 10) return true;
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
      if (parts[0] === 192 && parts[1] === 168) return true;
      if (parts[0] === 169 && parts[1] === 254) return true;
      if (parts[0] === 127) return true;
    }
    // Only allow http/https
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return true;
    return false;
  } catch {
    return true;
  }
}

async function inferFromUrl(rawUrl: string): Promise<InferProductResponse> {
  let url = rawUrl;
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  if (isPrivateUrl(url)) {
    return { name: "", description: "", confidence: 0, source: "none" };
  }

  let html: string;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      redirect: "follow",
      headers: {
        "User-Agent": "BuildInSocial/1.0 (+https://buildinsocial.com)",
      },
    });
    // Check redirected URL for SSRF
    if (isPrivateUrl(res.url)) {
      return { name: "", description: "", confidence: 0, source: "none" };
    }
    html = await res.text();
  } catch {
    return { name: "", description: "", confidence: 0, source: "none" };
  }

  const { ogTitle, ogDesc, metaDesc, titleTag, ogImage, ogSiteName } = extractMeta(html);

  // Compute favicon URL from domain
  let domain: string;
  try {
    domain = new URL(url).hostname;
  } catch {
    domain = url.replace(/^https?:\/\//, "").split("/")[0];
  }
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  const siteName = ogSiteName ?? undefined;

  // og:title + og:description present
  if (ogTitle && (ogDesc || metaDesc)) {
    const desc = ogDesc ?? metaDesc!;
    const fullDesc = toOneSentence(`${ogTitle} — ${desc}`);
    const confidence = desc.length > 50 ? 0.9 : 0.7;
    return { name: ogTitle, description: fullDesc, confidence, source: "og", ogImage: ogImage ?? undefined, faviconUrl, siteName };
  }

  // og:title only
  if (ogTitle) {
    return { name: ogTitle, description: ogTitle, confidence: 0.5, source: "og", ogImage: ogImage ?? undefined, faviconUrl, siteName };
  }

  // Only <title>
  if (titleTag) {
    return { name: titleTag, description: titleTag, confidence: 0.4, source: "title", faviconUrl, siteName };
  }

  // Nothing found
  return { name: "", description: "", confidence: 0, source: "none", faviconUrl };
}

/* -------------------------------------------------------------------------- */
/*  GitHub repo inference                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Matches GitHub repo URLs, with or without protocol/www, optional trailing
 * path (tree/blob/issues/etc). Explicitly excludes github.io (Pages sites).
 * Returns { owner, repo } or null.
 */
function parseGitHubUrl(rawUrl: string): { owner: string; repo: string } | null {
  const trimmed = rawUrl.trim();
  // Must be github.com, not github.io or other subdomains like gist.github.com
  const match = trimmed.match(
    /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/\s?#]+)\/([^/\s?#]+)(?:[/?#].*)?$/i
  );
  if (!match) return null;
  const owner = match[1];
  let repo = match[2];
  // Strip trailing ".git"
  repo = repo.replace(/\.git$/i, "");
  // Skip reserved top-level paths that are not repos
  const reserved = new Set([
    "orgs",
    "settings",
    "marketplace",
    "explore",
    "topics",
    "collections",
    "events",
    "sponsors",
    "notifications",
    "pulls",
    "issues",
    "new",
    "login",
    "join",
  ]);
  if (reserved.has(owner.toLowerCase())) return null;
  if (!owner || !repo) return null;
  return { owner, repo };
}

function humanCase(slug: string): string {
  return slug
    .replace(/[-_.]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface GitHubRepoApi {
  name: string;
  full_name: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  owner: { login: string; avatar_url: string };
}

async function fetchGitHubRepo(
  owner: string,
  repo: string,
  signal: AbortSignal
): Promise<{ status: number; data: GitHubRepoApi | null }> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    signal,
    headers: {
      "User-Agent": "BuildInSocial/1.0 (+https://buildinsocial.com)",
      Accept: "application/vnd.github+json",
    },
  });
  if (!res.ok) return { status: res.status, data: null };
  const data = (await res.json()) as GitHubRepoApi;
  return { status: res.status, data };
}

async function fetchGitHubReadme(
  owner: string,
  repo: string,
  signal: AbortSignal
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        signal,
        headers: {
          "User-Agent": "BuildInSocial/1.0 (+https://buildinsocial.com)",
          Accept: "application/vnd.github.raw",
        },
      }
    );
    if (!res.ok) return null;
    const text = await res.text();
    return text.slice(0, 2000);
  } catch {
    return null;
  }
}

/**
 * Extracts the first meaningful paragraph from README markdown. Strips common
 * markdown noise (badges, headings, HTML comments) so the preview reads well.
 */
function firstReadmeParagraph(markdown: string): string {
  // Remove HTML comments
  let md = markdown.replace(/<!--[\s\S]*?-->/g, "");
  // Drop code fences entirely
  md = md.replace(/```[\s\S]*?```/g, "");
  const lines = md.split(/\r?\n/);
  const buf: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      if (buf.length) break;
      continue;
    }
    if (line.startsWith("#")) continue; // heading
    if (/^!\[/.test(line)) continue; // image-only (often badges)
    if (/^\[!\[/.test(line)) continue; // linked badge
    if (/^<[^>]+>/.test(line) && !/[A-Za-z]{4,}/.test(line.replace(/<[^>]+>/g, ""))) continue;
    // Strip inline markdown links/images but keep text
    const cleaned = line
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links -> text
      .replace(/[*_`]/g, "")
      .trim();
    if (!cleaned) continue;
    buf.push(cleaned);
    if (buf.join(" ").length > 220) break;
  }
  return truncate(buf.join(" ").trim(), 300);
}

async function inferFromGitHub(
  owner: string,
  repo: string,
  outerSignal?: AbortSignal
): Promise<InferProductResponse> {
  // TODO(cache): wrap in Upstash Redis cache (key: gh:{owner}/{repo}, TTL ~1h)
  // once the generic API cache helper exists. Reuse, do not introduce new infra.
  const timeoutSignal = AbortSignal.timeout(6000);
  const signal = outerSignal
    ? AbortSignal.any([outerSignal, timeoutSignal])
    : timeoutSignal;

  const faviconUrl = `https://www.google.com/s2/favicons?domain=github.com&sz=64`;
  const fullName = `${owner}/${repo}`;
  const humanName = humanCase(repo);

  let repoRes: { status: number; data: GitHubRepoApi | null };
  try {
    repoRes = await fetchGitHubRepo(owner, repo, signal);
  } catch {
    // Network/timeout — fall through to HTML scraper.
    return inferFromUrl(`https://github.com/${owner}/${repo}`);
  }

  // Rate-limited — degrade gracefully to HTML scraping.
  if (repoRes.status === 403 || repoRes.status === 429) {
    return inferFromUrl(`https://github.com/${owner}/${repo}`);
  }

  // 404 — surface a low-confidence stub so the UI can fall back to manual edit.
  if (repoRes.status === 404 || !repoRes.data) {
    return {
      name: fullName,
      description: "",
      confidence: 0.2,
      source: "github",
      faviconUrl,
      siteName: "GitHub",
    };
  }

  const data = repoRes.data;
  const ghDescription = (data.description ?? "").trim();
  const ogImage = data.owner?.avatar_url ?? undefined;
  const siteName = "GitHub";

  // Strong signal: repo has a description.
  if (ghDescription.length >= 20) {
    return {
      name: humanName || fullName,
      description: ghDescription,
      confidence: 0.85,
      source: "github",
      ogImage,
      faviconUrl,
      siteName,
    };
  }

  // Weak/empty description — try README to enrich.
  let readme: string | null = null;
  try {
    readme = await fetchGitHubReadme(owner, repo, signal);
  } catch {
    readme = null;
  }

  const readmePara = readme ? firstReadmeParagraph(readme) : "";

  if (ghDescription && readmePara) {
    return {
      name: humanName || fullName,
      description: truncate(`${ghDescription} — ${readmePara}`, 300),
      confidence: 0.85,
      source: "github",
      ogImage,
      faviconUrl,
      siteName,
    };
  }

  if (readmePara) {
    return {
      name: humanName || fullName,
      description: readmePara,
      confidence: 0.6,
      source: "github",
      ogImage,
      faviconUrl,
      siteName,
    };
  }

  if (ghDescription) {
    return {
      name: humanName || fullName,
      description: ghDescription,
      confidence: 0.6,
      source: "github",
      ogImage,
      faviconUrl,
      siteName,
    };
  }

  // Repo exists but no description and no usable README.
  return {
    name: humanName || fullName,
    description: "",
    confidence: 0.4,
    source: "github",
    ogImage,
    faviconUrl,
    siteName,
  };
}

/* -------------------------------------------------------------------------- */
/*  Free-text inference                                                        */
/* -------------------------------------------------------------------------- */

function inferFromText(input: string): InferProductResponse {
  const trimmed = input.trim();

  if (trimmed.length < 10) {
    return { name: "", description: "", confidence: 0, source: "none" };
  }

  const words = trimmed.split(/\s+/);

  if (trimmed.length <= 40) {
    const name = words.slice(0, 3).join(" ");
    // Normalize: capitalize first letter, ensure ends with period
    let description = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    if (!/[.!?]$/.test(description)) description += ".";
    return { name, description, confidence: 0.5, source: "freetext" };
  }

  // > 40 chars
  // Try first quoted string for name
  const quotedMatch = trimmed.match(/["']([^"']+)["']/);
  const name = quotedMatch ? quotedMatch[1] : words.slice(0, 3).join(" ");

  let description = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  if (!/[.!?]$/.test(description)) description += ".";

  return { name, description, confidence: 0.7, source: "freetext" };
}

/* -------------------------------------------------------------------------- */
/*  POST handler                                                               */
/* -------------------------------------------------------------------------- */

export async function POST(request: Request) {
  // SECURITY (S4): IP-keyed rate limit — unauth endpoint, 10/min.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const limited = await checkRateLimit(`ip:${ip}`, "infer-product", 10, "1 m");
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { data: null, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const parsed = InputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const input = parsed.data.input;

  // Determine if URL: no spaces AND (starts with http/https OR contains a dot)
  const isUrl =
    !input.includes(" ") &&
    (/^https?:\/\//i.test(input) || input.includes("."));

  let result: InferProductResponse;

  if (isUrl) {
    const gh = parseGitHubUrl(input);
    if (gh) {
      result = await inferFromGitHub(gh.owner, gh.repo, request.signal);
      // If GitHub lookup came back with very low confidence and no name,
      // leave it — the UI handles this as manual fallback. We deliberately
      // don't re-scrape HTML for 404s since that's expected to also fail.
    } else {
      result = await inferFromUrl(input);
    }
  } else {
    result = inferFromText(input);
  }

  return NextResponse.json({ data: result, error: null });
}
