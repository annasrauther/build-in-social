/**
 * Real brand kit service — NoCodeBackend REST.
 * GET/PATCH on brand_kits resource. Creates record if 404.
 */

import type { BrandKit } from "@/lib/types/brand";
import { NCB_DATA_API_URL, NOCODEBACKEND_SECRET_KEY, NCB_INSTANCE } from "@/lib/env";

const BASE_URL = NCB_DATA_API_URL ?? `https://app.nocodebackend.com/api/data`;
const INSTANCE = NCB_INSTANCE ?? "55194_buildinsocial";
const TOKEN = NOCODEBACKEND_SECRET_KEY!;

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
  };
}

function resourceUrl(path = "") {
  return `${BASE_URL}/${INSTANCE}/brand_kits${path}`;
}

interface NcbBrandKitRow {
  id: string;
  user_id: string;
  primary_color: string;
  accent_color: string;
  logo_url: string | null;
  watermark_position: BrandKit["watermarkPosition"];
  font_style: BrandKit["fontStyle"];
  updated_at: string;
}

function mapRow(row: NcbBrandKitRow): BrandKit {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    primaryColor: row.primary_color,
    accentColor: row.accent_color,
    logoUrl: row.logo_url ?? null,
    watermarkPosition: row.watermark_position,
    fontStyle: row.font_style,
    updatedAt: row.updated_at,
  };
}

const DEFAULTS: Omit<BrandKit, "id" | "userId" | "updatedAt"> = {
  primaryColor: "#D97757",
  accentColor: "#6A9BCC",
  logoUrl: null,
  watermarkPosition: "bottom-right",
  fontStyle: "modern",
};

export async function getBrandKit(userId: string): Promise<BrandKit> {
  const res = await fetch(`${resourceUrl()}?user_id=${encodeURIComponent(userId)}&limit=1`, {
    headers: headers(),
    cache: "no-store",
  });

  if (res.ok) {
    const json = await res.json();
    const rows: NcbBrandKitRow[] = json.data ?? json.results ?? [];
    if (rows.length > 0) return mapRow(rows[0]);
  }

  // Create default record
  const createRes = await fetch(resourceUrl(), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      user_id: userId,
      primary_color: DEFAULTS.primaryColor,
      accent_color: DEFAULTS.accentColor,
      logo_url: DEFAULTS.logoUrl,
      watermark_position: DEFAULTS.watermarkPosition,
      font_style: DEFAULTS.fontStyle,
    }),
  });

  if (!createRes.ok) {
    throw new Error(`Failed to create brand kit: ${createRes.status}`);
  }

  const created = await createRes.json();
  return mapRow(created.data ?? created);
}

export async function updateBrandKit(
  userId: string,
  partial: Partial<BrandKit>
): Promise<BrandKit> {
  const existing = await getBrandKit(userId);

  const body: Record<string, unknown> = {};
  if (partial.primaryColor !== undefined) body.primary_color = partial.primaryColor;
  if (partial.accentColor !== undefined) body.accent_color = partial.accentColor;
  if (partial.logoUrl !== undefined) body.logo_url = partial.logoUrl;
  if (partial.watermarkPosition !== undefined) body.watermark_position = partial.watermarkPosition;
  if (partial.fontStyle !== undefined) body.font_style = partial.fontStyle;

  const res = await fetch(resourceUrl(`/${existing.id}`), {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Failed to update brand kit: ${res.status}`);
  }

  const json = await res.json();
  return mapRow(json.data ?? json);
}
