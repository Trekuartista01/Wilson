import { requireAdmin } from "@/lib/server/auth";
import { notFound, route } from "@/lib/server/errors";
import { deleteProperty, getProperty, updateProperty } from "@/lib/server/properties";
import { readJson } from "@/lib/server/request";
import { propertyPatchSchema, uuidSchema } from "@/lib/server/schemas";

type Context = RouteContext<"/api/admin/properties/[id]">;

async function propertyId(context: Context): Promise<string> {
  const parsed = uuidSchema.safeParse((await context.params).id);
  if (!parsed.success) throw notFound("Property not found.");
  return parsed.data;
}

/** GET /api/admin/properties/:id */
export const GET = route<Context>(async (request, context) => {
  await requireAdmin(request);
  return Response.json(await getProperty(await propertyId(context)), { headers: { "Cache-Control": "no-store" } });
});

/** PATCH /api/admin/properties/:id — update any subset of fields. The slug never changes. */
export const PATCH = route<Context>(async (request, context) => {
  await requireAdmin(request);
  const id = await propertyId(context);
  const patch = await readJson(request, propertyPatchSchema);
  return Response.json(await updateProperty(id, patch));
});

/** DELETE /api/admin/properties/:id — removes the listing, its translations and photos. */
export const DELETE = route<Context>(async (request, context) => {
  await requireAdmin(request);
  await deleteProperty(await propertyId(context));
  return new Response(null, { status: 204 });
});
