export interface InferProductRequest {
  input: string;
}

export type InferProductSource = "og" | "title" | "freetext" | "github" | "none";

export interface InferProductResponse {
  name: string;
  description: string;
  confidence: number; // 0.0-1.0
  source: InferProductSource;
  ogImage?: string;
  faviconUrl?: string;
  siteName?: string;
}
