import "server-only";
import { createHash } from "node:crypto";
import type { z } from "zod";
import { ApiError, badRequest, forbidden } from "./errors";

/** Largest JSON body any route accepts. Property descriptions in 3 languages fit easily. */
const MAX_JSON_BYTES = 64 * 1024;

/**
 * Reads and validates a JSON body. Rejects the wrong content type, oversized bodies and
 * malformed JSON before the schema runs; the schema's ZodError becomes a 400 in `route()`.
 */
export async function readJson<S extends z.ZodType>(request: Request, schema: S): Promise<z.infer<S>> {
  const type = request.headers.get("content-type") ?? "";
  if (!type.toLowerCase().startsWith("application/json")) {
    throw new ApiError(415, "unsupported_media_type", "Send the request as JSON.");
  }
  const declared = Number(request.headers.get("content-length"));
  if (declared > MAX_JSON_BYTES) throw tooLarge();

  const text = await request.text();
  if (Buffer.byteLength(text) > MAX_JSON_BYTES) throw tooLarge();

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw badRequest("The request body is not valid JSON.", "invalid_json");
  }
  return schema.parse(data);
}

const tooLarge = () => new ApiError(413, "payload_too_large", "The request is too large.");

/**
 * The visitor's IP, for rate limiting. On Vercel the first x-forwarded-for entry is the
 * client (set by Vercel's edge, not spoofable past it). Returned hashed: rate limit keys
 * never store raw IP addresses.
 */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

/**
 * CSRF guard for state-changing admin requests. The session cookie is SameSite=Strict
 * already; this also refuses any request whose Origin isn't this site.
 */
export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin) throw forbidden();
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw forbidden();
  }
  if (!host || originHost !== host) throw forbidden();
}
