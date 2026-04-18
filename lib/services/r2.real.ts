/**
 * Real Cloudflare R2 storage implementation using AWS S3-compatible SDK.
 * Falls back to mock when R2 credentials are not set.
 * R2 is S3-compatible: endpoint = https://<account_id>.r2.cloudflarestorage.com
 */

import { S3Client, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let _client: S3Client | null = null;

function getClient(): S3Client {
  if (!_client) {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    if (!accountId) throw new Error("CLOUDFLARE_ACCOUNT_ID not set");
    _client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
      },
    });
  }
  return _client;
}

function bucket(): string {
  return process.env.R2_BUCKET_NAME ?? "buildinsocial-videos";
}

function publicUrl(key: string): string {
  const base = process.env.R2_PUBLIC_URL ?? "";
  return `${base}/${key}`;
}

export async function getPresignedUploadUrl(params: {
  key: string;
  contentType: string;
}): Promise<{ uploadUrl: string; publicUrl: string }> {
  const command = new PutObjectCommand({
    Bucket: bucket(),
    Key: params.key,
    ContentType: params.contentType,
  });

  const uploadUrl = await getSignedUrl(getClient(), command, { expiresIn: 3600 });
  return { uploadUrl, publicUrl: publicUrl(params.key) };
}

export async function uploadBuffer(params: {
  key: string;
  buffer: Buffer | Uint8Array;
  contentType: string;
}): Promise<{ publicUrl: string }> {
  const command = new PutObjectCommand({
    Bucket: bucket(),
    Key: params.key,
    Body: params.buffer,
    ContentType: params.contentType,
  });
  await getClient().send(command);
  return { publicUrl: publicUrl(params.key) };
}

export async function deleteObject(key: string): Promise<void> {
  const command = new DeleteObjectCommand({ Bucket: bucket(), Key: key });
  await getClient().send(command);
}
