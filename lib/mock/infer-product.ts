import type { InferProductResponse } from "@/lib/types/infer-product";

export async function inferProductMock(): Promise<InferProductResponse> {
  return { name: "", description: "", confidence: 0, source: "none" };
}

/**
 * Dev fixture: what a successful GitHub repo lookup looks like.
 * Use when offline or when rate-limited during local development.
 */
export const githubRepoMock: InferProductResponse = {
  name: "Next.js",
  description:
    "The React Framework for the Web — used by some of the world's largest companies, Next.js enables you to create high-quality web applications with the power of React components.",
  confidence: 0.85,
  source: "github",
  ogImage: "https://avatars.githubusercontent.com/u/14985020?v=4",
  faviconUrl: "https://www.google.com/s2/favicons?domain=github.com&sz=64",
  siteName: "GitHub",
};
