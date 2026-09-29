"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiTrash2 } from "react-icons/fi";
import { adminApi } from "./api";
import ConfirmDialog from "./ConfirmDialog";
import { a } from "./strings";

/** Deletes the listing, its translations and photos, after a confirmation. */
export default function DeletePropertyButton({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setBusy(true);
    setError("");
    try {
      await adminApi(`/properties/${propertyId}`, { method: "DELETE" });
      router.replace("/admin/properties");
      router.refresh();
    } catch {
      setError(a.delete.error);
      setBusy(false);
      setOpen(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center gap-2 rounded-md px-4 text-sm font-medium text-red-700 ring-1 ring-red-200 transition-colors hover:bg-red-50"
      >
        <FiTrash2 aria-hidden className="size-4" />
        {a.delete.button}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <ConfirmDialog
        open={open}
        title={a.delete.title}
        text={a.delete.text}
        confirmLabel={a.delete.confirm}
        busy={busy}
        onConfirm={remove}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
}
