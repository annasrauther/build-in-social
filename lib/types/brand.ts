/**
 * Brand kit type — controls visual identity across all rendered videos.
 */

export interface BrandKit {
  id: string;
  userId: string;
  primaryColor: string; // hex e.g. "#D97757"
  accentColor: string; // hex
  logoUrl: string | null; // Cloudflare R2 URL
  watermarkPosition:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "none";
  fontStyle: "modern" | "bold" | "minimal" | "playful";
  updatedAt: string;
}
