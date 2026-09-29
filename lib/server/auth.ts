import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/session-cookie";
import { authEnv } from "./env";
import { unauthorized } from "./errors";
import { assertSameOrigin } from "./request";

/**
 * Admin authentication: one admin account whose username and bcrypt password hash live in
 * the environment (no user table). A successful login gets a signed JWT in an httpOnly,
 * SameSite=Strict cookie; nothing is ever stored in localStorage.
 */

export { SESSION_COOKIE };
const SESSION_SECONDS = 8 * 60 * 60; // one working day
const ISSUER = "wilson-real-estate";
const AUDIENCE = "wilson-admin";

// A valid bcrypt hash of a random string: compared against when the username is wrong,
// so a wrong username costs the same time as a wrong password (no username probing).
// Not a secret: it hashes a random throwaway string nobody knows.
const DUMMY_HASH = "$2b$12$6zsysNqenX5t0EZ4OsE.9OWaDPMGOGxBtXciKgtGDqAqj2OG1iEYy";

function sameString(a: string, b: string): boolean {
  // Hash first so the comparison is constant-time regardless of the input lengths.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const { username: expected, passwordHash } = authEnv();
  const userOk = sameString(username, expected);
  const passwordOk = await bcrypt.compare(password, userOk ? passwordHash : DUMMY_HASH);
  return userOk && passwordOk;
}

export async function startSession(username: string): Promise<void> {
  const { jwtSecret } = authEnv();
  const token = jwt.sign({ role: "admin" }, jwtSecret, {
    algorithm: "HS256",
    expiresIn: SESSION_SECONDS,
    subject: username,
    issuer: ISSUER,
    audience: AUDIENCE,
  });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

export type AdminSession = { username: string; expiresAt: number };

/** The current admin session, or null if there is none or it's invalid/expired. */
export async function getAdminSession(): Promise<AdminSession | null> {
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}

/** Checks a session token (also used by proxy.ts, which reads the cookie from the request). */
export function verifySessionToken(token: string | undefined): AdminSession | null {
  if (!token) return null;
  const { jwtSecret, username } = authEnv();
  try {
    const payload = jwt.verify(token, jwtSecret, {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
    }) as jwt.JwtPayload;
    // A token for a renamed admin account stops working.
    if (payload.role !== "admin" || payload.sub !== username || !payload.exp) return null;
    return { username: payload.sub, expiresAt: payload.exp * 1000 };
  } catch {
    return null;
  }
}

/**
 * Gate for every admin API route: 401 without a valid session, and for anything that
 * changes data, 403 unless the request comes from this site (CSRF).
 */
export async function requireAdmin(request: Request): Promise<AdminSession> {
  if (!["GET", "HEAD"].includes(request.method)) assertSameOrigin(request);
  const session = await getAdminSession();
  if (!session) throw unauthorized();
  return session;
}

/**
 * Gate for every admin page (in addition to proxy.ts): without a valid session, go to the
 * login page. Pages check for themselves because a proxy matcher can silently stop covering
 * a route after a refactor.
 */
export async function requireAdminPage(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
