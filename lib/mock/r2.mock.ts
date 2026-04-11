/**
 * Mock Cloudflare R2 storage
 * Replace by updating /lib/services/r2.ts when R2 credentials are ready
 */

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export async function getPresignedUploadUrl(params: {
  key: string;
  contentType: string;
}): Promise<{ uploadUrl: string; publicUrl: string }> {
  console.log("[MOCK r2] getPresignedUploadUrl", params.key);
  await delay();
  return {
    uploadUrl: `https://mock-r2.example.com/upload/${params.key}`,
    publicUrl: `https://mock-r2.example.com/public/${params.key}`,
  };
}

export async function deleteObject(key: string): Promise<void> {
  console.log("[MOCK r2] deleteObject", key);
  await delay(100);
}
