import { startSession, verifyCredentials } from "@/lib/server/auth";
import { ApiError, route } from "@/lib/server/errors";
import { rateLimit } from "@/lib/server/rate-limit";
import { assertSameOrigin, clientKey, readJson } from "@/lib/server/request";
import { loginSchema } from "@/lib/server/schemas";

/**
 * POST /api/admin/login — { username, password }. On success sets the httpOnly session
 * cookie. Limited to 5 attempts per 15 minutes per visitor, and 20 per hour in total
 * against the admin account, so a password can't be guessed from many addresses either.
 */
export const POST = route(async (request) => {
  assertSameOrigin(request);
  await rateLimit({ scope: "login", key: clientKey(request), limit: 5, windowSeconds: 15 * 60 });
  await rateLimit({ scope: "login-all", key: "admin", limit: 20, windowSeconds: 60 * 60 });

  const { username, password } = await readJson(request, loginSchema);

  if (!(await verifyCredentials(username, password))) {
    console.warn("[auth] failed admin login attempt");
    throw new ApiError(401, "invalid_credentials", "Invalid username or password.");
  }

  await startSession(username);
  return Response.json({ ok: true });
});
