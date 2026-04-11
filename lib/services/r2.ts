/**
 * Cloudflare R2 storage service — uses real AWS S3-compatible SDK when
 * R2 credentials are set, falls back to mock for local development.
 */

import * as mock from "@/lib/mock/r2.mock";
import * as real from "@/lib/services/r2.real";

const useReal = !!(
  process.env.CLOUDFLARE_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY
);

export const getPresignedUploadUrl: typeof real.getPresignedUploadUrl = useReal
  ? real.getPresignedUploadUrl
  : mock.getPresignedUploadUrl;

export const deleteObject: typeof real.deleteObject = useReal
  ? real.deleteObject
  : mock.deleteObject;
