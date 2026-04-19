/**
 * Caption style types — controls how on-screen captions look in rendered videos.
 */

export type CaptionStyle = "minimal" | "bold" | "gradient" | "outline" | "none";

export interface CaptionConfig {
  style: CaptionStyle;
  fontSize: "sm" | "md" | "lg";
  color: string;
}
