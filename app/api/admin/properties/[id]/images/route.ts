import { requireAdmin } from "@/lib/server/auth";
import { ApiError, badRequest, notFound, route } from "@/lib/server/errors";
import { MAX_UPLOAD_BYTES, addPropertyImage, reorderPropertyImages } from "@/lib/server/images";
import { readJson } from "@/lib/server/request";
import { reorderImagesSchema, uuidSchema } from "@/lib/server/schemas";

type Context = RouteContext<"/api/admin/properties/[id]/images">;

async function propertyId(context: Context): Promise<string> {
  const parsed = uuidSchema.safeParse((await context.params).id);
  if (!parsed.success) throw notFound("Property not found.");
  return parsed.data;
}

/**
 * POST /api/admin/properties/:id/images — multipart form with one `file` (JPEG, PNG or
 * WebP, max 4 MB). Stored as WebP; returns the new image.
 */
export const POST = route<Context>(async (request, context) => {
  await requireAdmin(request);
  const id = await propertyId(context);

  // Refuse oversized bodies before reading them (form overhead allowed on top of the file).
  const length = Number(request.headers.get("content-length"));
  if (!length) throw new ApiError(411, "length_required", "Content-Length is required.");
  if (length > MAX_UPLOAD_BYTES + 64 * 1024) throw new ApiError(413, "file_too_large", "Images can be at most 4 MB.");
  if (!(request.headers.get("content-type") ?? "").startsWith("multipart/form-data")) {
    throw new ApiError(415, "unsupported_media_type", "Send the image as multipart/form-data.");
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    throw badRequest("The upload could not be read.");
  }
  const file = form.get("file");
  if (!(file instanceof File)) throw badRequest("Attach the image as `file`.", "missing_file");

  return Response.json(await addPropertyImage(id, file), { status: 201 });
});

/** PATCH /api/admin/properties/:id/images — { order: [imageId, ...] }, every image exactly once. */
export const PATCH = route<Context>(async (request, context) => {
  await requireAdmin(request);
  const id = await propertyId(context);
  const { order } = await readJson(request, reorderImagesSchema);
  await reorderPropertyImages(id, order);
  return new Response(null, { status: 204 });
});
