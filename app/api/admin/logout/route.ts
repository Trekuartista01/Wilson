import { endSession } from "@/lib/server/auth";
import { route } from "@/lib/server/errors";
import { assertSameOrigin } from "@/lib/server/request";

/** POST /api/admin/logout — clears the session cookie. */
export const POST = route(async (request) => {
  assertSameOrigin(request);
  await endSession();
  return Response.json({ ok: true });
});
