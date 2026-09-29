import "server-only";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { ApiError, badRequest } from "./errors";
import { dbError, getProperty, publicImageUrl, refreshSite, removeFiles, type AdminPropertyImage } from "./properties";
import { PROPERTY_IMAGES_BUCKET, supabaseAdmin } from "./supabase";

/**
 * Listing photo uploads. Vercel caps request bodies at 4.5 MB, so the admin panel should
 * downscale big camera/drone photos in the browser before sending them; the server still
 * enforces everything itself.
 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_IMAGES_PER_PROPERTY = 30;
const MAX_EDGE = 2560;

/** Real file type from the first bytes (the browser's Content-Type and file name can lie). */
function sniff(buf: Buffer): "jpeg" | "png" | "webp" | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.length >= 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
}

/**
 * Checks and re-encodes an upload: JPEG / PNG / WebP only, max 4 MB, then rotated upright,
 * scaled to at most 2560 px and saved as WebP. Re-encoding also drops all metadata
 * (EXIF, including a drone's GPS position) and anything hidden inside the file.
 */
export async function processImage(file: File): Promise<{ data: Buffer; width: number; height: number }> {
  if (file.size === 0) throw badRequest("The file is empty.", "empty_file");
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ApiError(413, "file_too_large", "Images can be at most 4 MB.");
  }
  const input = Buffer.from(await file.arrayBuffer());
  if (!sniff(input)) {
    throw new ApiError(415, "unsupported_image", "Only JPEG, PNG and WebP images are allowed.");
  }
  try {
    const { data, info } = await sharp(input, { limitInputPixels: 60_000_000, failOn: "error" })
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
    return { data, width: info.width, height: info.height };
  } catch {
    throw badRequest("The image could not be read.", "invalid_image");
  }
}

export async function addPropertyImage(propertyId: string, file: File): Promise<AdminPropertyImage> {
  // Bad files are rejected before touching the database.
  const { data, width, height } = await processImage(file);
  const property = await getProperty(propertyId); // 404 if missing
  if (property.images.length >= MAX_IMAGES_PER_PROPERTY) {
    throw new ApiError(409, "too_many_images", `A property can have at most ${MAX_IMAGES_PER_PROPERTY} images.`);
  }

  const db = supabaseAdmin();
  const path = `${propertyId}/${randomUUID()}.webp`;
  const { error: uploadError } = await db.storage.from(PROPERTY_IMAGES_BUCKET).upload(path, data, {
    contentType: "image/webp",
    // One hour: long enough for caching, short enough that a deleted photo stops loading
    // from the CDN soon after (a year-long cache kept deleted photos reachable).
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadError) throw Object.assign(new Error("Storage upload failed"), { cause: uploadError });

  const position = property.images.reduce((max, img) => Math.max(max, img.position + 1), 0);
  const { data: row, error } = await db
    .from("property_images")
    .insert({ property_id: propertyId, storage_path: path, width, height, position })
    .select("id, storage_path, width, height, position")
    .single();
  if (error) {
    await removeFiles([path]); // don't leave an orphaned file behind
    throw dbError(error);
  }
  refreshSite();
  return { id: row.id, url: publicImageUrl(row.storage_path), width: row.width, height: row.height, position: row.position };
}

export async function deletePropertyImage(propertyId: string, imageId: string): Promise<void> {
  const { data, error } = await supabaseAdmin()
    .from("property_images")
    .delete()
    .eq("id", imageId)
    .eq("property_id", propertyId)
    .select("storage_path");
  if (error) throw dbError(error);
  if (!data.length) throw new ApiError(404, "not_found", "Image not found.");
  await removeFiles(data.map((d) => d.storage_path));
  refreshSite();
}

export async function reorderPropertyImages(propertyId: string, order: string[]): Promise<void> {
  const { error } = await supabaseAdmin().rpc("admin_reorder_images", { p_property_id: propertyId, p_ids: order });
  if (error) throw dbError(error);
  refreshSite();
}
