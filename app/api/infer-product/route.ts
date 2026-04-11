import { NextResponse } from "next/server";
import { z } from "zod";
import type { InferProductResponse } from "@/lib/types/infer-product";

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
    result = await inferFromUrl(input);
  } else {
    result = inferFromText(input);
  }

  return NextResponse.json({ data: result, error: null });
}
