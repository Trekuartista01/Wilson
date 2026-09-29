import { requireAdmin } from "@/lib/server/auth";
import { notFound, route } from "@/lib/server/errors";
import { deletePropertyImage } from "@/lib/server/images";
import { uuidSchema } from "@/lib/server/schemas";

type Context = RouteContext<"/api/admin/properties/[id]/images/[imageId]">;

/** DELETE /api/admin/properties/:id/images/:imageId — removes the photo and its file. */
export const DELETE = route<Context>(async (request, context) => {
  await requireAdmin(request);
  const { id, imageId } = await context.params;
  const ids = [uuidSchema.safeParse(id), uuidSchema.safeParse(imageId)];
  if (!ids[0].success || !ids[1].success) throw notFound("Image not found.");
  await deletePropertyImage(ids[0].data, ids[1].data);
  return new Response(null, { status: 204 });
});
