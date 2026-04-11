import type { InferProductResponse } from "@/lib/types/infer-product";

export async function inferProduct(
  input: string,
  signal?: AbortSignal
): Promise<InferProductResponse> {
  const res = await fetch("/api/infer-product", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
    signal,
  });
  const json = await res.json();
  if (json.error || !json.data)
    return { name: "", description: "", confidence: 0, source: "none" };
  return json.data;
}
