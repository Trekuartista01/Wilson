import { requireAdmin } from "@/lib/server/auth";
import { route } from "@/lib/server/errors";

/** GET /api/admin/session — who is signed in and until when; 401 if nobody. */
export const GET = route(async (request) => {
  const session = await requireAdmin(request);
  return Response.json(
    { username: session.username, expiresAt: new Date(session.expiresAt).toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
});
