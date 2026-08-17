const encoder = new TextEncoder();
const SECRET = process.env.AUTH_SECRET ?? "dev-only-insecure-secret-change-me";

export const AUTH_COOKIE = "hd_auth";
export const PROFILE_COOKIE = "hd_profile";

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(value: string): Promise<string> {
  const key = await hmacKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toHex(signature);
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function signToken(value: string): Promise<string> {
  return `${value}.${await sign(value)}`;
}

export async function verifyToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const [value, signature] = token.split(".");
  if (!value || !signature) return null;
  const expected = await sign(value);
  if (!timingSafeEqualStr(expected, signature)) return null;
  return value;
}

export function checkPassword(candidate: string): boolean {
  const expected = process.env.APP_PASSWORD ?? "";
  if (!expected) return false;
  return timingSafeEqualStr(candidate, expected);
}
