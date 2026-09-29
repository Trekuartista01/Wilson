"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiChevronLeft, FiChevronRight, FiTrash2, FiUpload } from "react-icons/fi";
import type { AdminPropertyImage } from "@/lib/server/properties";
import { AdminApiError, adminApi } from "./api";
import ConfirmDialog from "./ConfirmDialog";
import { a, fill } from "./strings";

const MAX_EDGE = 2560;
// The server takes up to 4 MB; stay a bit under so the multipart overhead never tips it over.
const TARGET_BYTES = 3.8 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

/**
 * Shrinks big photos in the browser before upload (Vercel refuses bodies over 4.5 MB, and
 * drone photos are often 10+ MB): at most 2560 px, re-encoded as JPEG. Small photos are
 * sent as they are. The server checks and re-encodes everything again either way.
 */
async function prepare(file: File): Promise<Blob> {
  if (!ACCEPTED.includes(file.type)) return file; // let the server reject it with its message
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= TARGET_BYTES) {
    bitmap.close();
    return file;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff"; // transparent PNG areas become white, not black
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  for (const quality of [0.88, 0.8, 0.7, 0.6]) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (blob && blob.size <= TARGET_BYTES) return blob;
  }
  return file;
}

/** Photos of one listing: upload, reorder (first = main photo), delete. */
export default function ImageManager({ propertyId, images: initial, title }: { propertyId: string; images: AdminPropertyImage[]; title: string }) {
  const router = useRouter();
  const [images, setImages] = useState(initial);
  const [progress, setProgress] = useState<{ n: number; total: number } | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [toDelete, setToDelete] = useState<AdminPropertyImage | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  // Keep in sync when the server data changes (after router.refresh()).
  const [synced, setSynced] = useState(initial);
  if (synced !== initial) {
    setSynced(initial);
    setImages(initial);
  }

  async function upload(files: FileList) {
    const list = [...files];
    const errors: string[] = [];
    setMessages([]);
    for (const [i, file] of list.entries()) {
      setProgress({ n: i + 1, total: list.length });
      try {
        const body = new FormData();
        body.append("file", await prepare(file), file.name);
        const image = await adminApi<AdminPropertyImage>(`/properties/${propertyId}/images`, { method: "POST", body });
        setImages((current) => [...current, image]);
      } catch (error) {
        if (error instanceof AdminApiError && error.code === "too_many_images") {
          errors.push(a.images.tooMany);
          break;
        }
        errors.push(fill(a.images.failed, { name: file.name, reason: error instanceof AdminApiError ? error.message : a.images.error }));
      }
    }
    setProgress(null);
    setMessages(errors);
    if (input.current) input.current.value = "";
    router.refresh();
  }

  async function move(index: number, dir: -1 | 1) {
    const next = [...images];
    [next[index], next[index + dir]] = [next[index + dir], next[index]];
    const previous = images;
    setImages(next); // optimistic
    try {
      await adminApi(`/properties/${propertyId}/images`, { method: "PATCH", json: { order: next.map((i) => i.id) } });
      router.refresh();
    } catch {
      setImages(previous);
      setMessages([a.images.error]);
    }
  }

  async function remove(image: AdminPropertyImage) {
    setBusy(true);
    try {
      await adminApi(`/properties/${propertyId}/images/${image.id}`, { method: "DELETE" });
      setImages((current) => current.filter((i) => i.id !== image.id));
      router.refresh();
    } catch {
      setMessages([a.images.error]);
    }
    setBusy(false);
    setToDelete(null);
  }

  return (
    <section className="rounded-lg bg-surface p-4 ring-1 ring-line sm:p-6" aria-labelledby="images-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-xl">
          <h2 id="images-heading" className="font-sans text-lg font-bold">
            {a.images.title} ({images.length})
          </h2>
          <p className="mt-1 text-sm text-ink-muted">{a.images.hint}</p>
        </div>
        <label
          className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md bg-brand-primary px-4 text-sm font-medium text-surface transition-colors hover:bg-black has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-primary has-[:focus-visible]:ring-offset-2 ${
            progress ? "pointer-events-none opacity-60" : ""
          }`}
        >
          <FiUpload aria-hidden className="size-4" />
          {progress ? fill(a.images.uploading, progress) : a.images.add}
          <input
            ref={input}
            type="file"
            accept={ACCEPTED.join(",")}
            multiple
            disabled={!!progress}
            onChange={(e) => e.target.files?.length && void upload(e.target.files)}
            className="sr-only"
          />
        </label>
      </div>

      <div role="status" aria-live="polite">
        {messages.length > 0 && (
          <ul className="mt-4 space-y-1 rounded-md bg-red-50 p-3 text-sm text-red-800">
            {messages.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
      </div>

      {images.length === 0 ? (
        <p className="mt-6 rounded-md border border-dashed border-line p-8 text-center text-sm text-ink-muted">{a.images.empty}</p>
      ) : (
        <ol className="mt-6 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, i) => {
            const label = fill(a.images.photo, { n: i + 1 });
            return (
              <li key={image.id} className="overflow-hidden rounded-md ring-1 ring-line">
                <div className="relative aspect-[4/3] bg-placeholder">
                  <Image src={image.url} alt={`${title}: ${label}`} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" className="object-cover" />
                  {i === 0 && (
                    <span className="absolute top-2 left-2 rounded-full bg-brand-accent px-2 py-0.5 text-xs font-bold text-ink">{a.images.cover}</span>
                  )}
                </div>
                <div className="flex items-center justify-between bg-surface">
                  <div className="flex">
                    <IconButton label={`${a.images.moveLeft}: ${label}`} disabled={i === 0} onClick={() => move(i, -1)}>
                      <FiChevronLeft aria-hidden className="size-5" />
                    </IconButton>
                    <IconButton label={`${a.images.moveRight}: ${label}`} disabled={i === images.length - 1} onClick={() => move(i, 1)}>
                      <FiChevronRight aria-hidden className="size-5" />
                    </IconButton>
                  </div>
                  <IconButton label={`${a.images.delete}: ${label}`} onClick={() => setToDelete(image)} danger>
                    <FiTrash2 aria-hidden className="size-4" />
                  </IconButton>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title={a.images.deleteTitle}
        text={a.images.deleteText}
        confirmLabel={a.delete.confirm}
        busy={busy}
        onConfirm={() => toDelete && remove(toDelete)}
        onCancel={() => setToDelete(null)}
      />
    </section>
  );
}

function IconButton({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex size-11 shrink-0 items-center justify-center transition-colors disabled:opacity-30 ${
        danger ? "text-red-700 hover:bg-red-50" : "hover:bg-surface-subtle"
      }`}
    >
      {children}
    </button>
  );
}
