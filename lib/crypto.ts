/**
 * Symmetric encryption helper for secrets at rest.
 *
 * Algorithm: AES-256-GCM (authenticated encryption).
 * Key source: WORDPRESS_ENCRYPTION_KEY env var.
 *   - Accepts a base64 or base64url string that decodes to exactly 32 bytes.
 *   - Accepts a raw 64-char hex string (32 bytes).
 * Format emitted by `encryptSecret`:
 *   base64url( [12-byte IV] || [ciphertext] || [16-byte GCM tag] )
 *
 * SECURITY NOTES:
 *  - A fresh IV is generated per encrypt call via crypto.getRandomValues.
 *  - The GCM tag is verified on decrypt; tampered ciphertexts throw.
 *  - The plaintext never hits logs — callers must never log the return of
 *    `decryptSecret`.
 *  - Key must never be logged. Loading code guards against a missing or
 *    undersized key by throwing — we fail closed.
 *
 * The helpers are intentionally generic so they can wrap any secret (not
 * just the WP app password). Re-audit `@security-auditor` if the algorithm
 * or format changes.
 */

const IV_BYTES = 12;
const KEY_BYTES = 32;

function base64urlDecode(input: string): Uint8Array {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const bin = atob(padded + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function base64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function hexDecode(input: string): Uint8Array {
  if (!/^[0-9a-fA-F]+$/.test(input) || input.length % 2 !== 0) {
    throw new Error("Invalid hex string");
  }
  const out = new Uint8Array(input.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(input.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

/**
 * Load and validate the encryption key from an env-var-supplied string.
 * Accepts base64/base64url (recommended, 32-byte decoded) or 64-char hex.
 */
function loadKeyBytes(raw: string): Uint8Array {
  const trimmed = raw.trim();
  if (trimmed.length === 0) throw new Error("Encryption key is empty");

  // Try hex first only if it's exactly 64 chars.
  if (trimmed.length === 64 && /^[0-9a-fA-F]+$/.test(trimmed)) {
    const bytes = hexDecode(trimmed);
    if (bytes.length !== KEY_BYTES) {
      throw new Error(`Encryption key must decode to ${KEY_BYTES} bytes`);
    }
    return bytes;
  }

  // Otherwise treat as base64url/base64.
  let bytes: Uint8Array;
  try {
    bytes = base64urlDecode(trimmed);
  } catch {
    throw new Error("Encryption key must be base64url or hex");
  }
  if (bytes.length !== KEY_BYTES) {
    throw new Error(`Encryption key must decode to ${KEY_BYTES} bytes`);
  }
  return bytes;
}

async function importKey(keyBytes: Uint8Array): Promise<CryptoKey> {
  // Copy into a fresh buffer so the caller's reference can't be mutated later.
  const copy = new Uint8Array(keyBytes);
  return crypto.subtle.importKey(
    "raw",
    copy,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt a UTF-8 string with AES-256-GCM. Returns base64url(IV || CT || TAG).
 * The tag is automatically appended by Web Crypto's `encrypt`.
 */
export async function encryptSecret(
  plaintext: string,
  envKey: string | undefined
): Promise<string> {
  if (!envKey) {
    throw new Error(
      "Encryption key is missing. Set WORDPRESS_ENCRYPTION_KEY to a 32-byte base64/hex value."
    );
  }
  const keyBytes = loadKeyBytes(envKey);
  const cryptoKey = await importKey(keyBytes);
  const iv = new Uint8Array(IV_BYTES);
  crypto.getRandomValues(iv);
  const encoded = new TextEncoder().encode(plaintext);
  const ctAndTag = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, cryptoKey, encoded)
  );
  return base64urlEncode(concat(iv, ctAndTag));
}

/**
 * Decrypt a string produced by `encryptSecret`. Throws on tamper or bad key.
 */
export async function decryptSecret(
  ciphertext: string,
  envKey: string | undefined
): Promise<string> {
  if (!envKey) {
    throw new Error(
      "Encryption key is missing. Set WORDPRESS_ENCRYPTION_KEY to a 32-byte base64/hex value."
    );
  }
  const keyBytes = loadKeyBytes(envKey);
  const cryptoKey = await importKey(keyBytes);
  const bytes = base64urlDecode(ciphertext);
  if (bytes.length < IV_BYTES + 16) {
    throw new Error("Ciphertext too short");
  }
  const iv = bytes.slice(0, IV_BYTES);
  const ctAndTag = bytes.slice(IV_BYTES);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    ctAndTag
  );
  return new TextDecoder().decode(plain);
}

/**
 * Generate a fresh 32-byte key and return it as base64url.
 * Not used at runtime — exposed for operators rotating the key. Output
 * contains no padding to stay env-var safe.
 */
export function generateEncryptionKey(): string {
  const bytes = new Uint8Array(KEY_BYTES);
  crypto.getRandomValues(bytes);
  return base64urlEncode(bytes);
}

/**
 * Redact a secret for safe logging. Shows first 3 chars and hides the rest.
 * NEVER log the raw value.
 */
export function redactSecret(secret: string | undefined | null): string {
  if (!secret) return "[empty]";
  if (secret.length <= 4) return "***";
  return `${secret.slice(0, 3)}***(${secret.length})`;
}
