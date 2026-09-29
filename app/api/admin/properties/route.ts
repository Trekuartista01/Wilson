import { requireAdmin } from "@/lib/server/auth";
import { route } from "@/lib/server/errors";
import { createProperty, listProperties } from "@/lib/server/properties";
import { readJson } from "@/lib/server/request";
import { listQuerySchema, propertySchema } from "@/lib/server/schemas";

/** GET /api/admin/properties?page=&pageSize=&q= — all listings (published or not), newest first. */
export const GET = route(async (request) => {
  await requireAdmin(request);
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const query = listQuerySchema.parse(params);
  return Response.json(await listProperties(query), { headers: { "Cache-Control": "no-store" } });
});

/** POST /api/admin/properties — create a listing (all three languages required). */
export const POST = route(async (request) => {
  await requireAdmin(request);
  const input = await readJson(request, propertySchema);
  return Response.json(await createProperty(input), { status: 201 });
});
