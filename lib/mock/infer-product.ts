import type { InferProductResponse } from "@/lib/types/infer-product";

export async function inferProductMock(): Promise<InferProductResponse> {
  return { name: "", description: "", confidence: 0, source: "none" };
}
