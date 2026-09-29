"use client";

import { useEffect, useRef } from "react";
import { a } from "./strings";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  text: string;
  confirmLabel: string;
  busy?: boolean;
  /** Red confirm button for deletions (default); neutral for other confirmations. */
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Confirmation for destructive actions, built on <dialog> (focus trap, Escape to close)
 * instead of window.confirm.
 */
export default function ConfirmDialog({ open, title, text, confirmLabel, busy, danger = true, onConfirm, onCancel }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
      aria-labelledby="confirm-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg bg-surface p-6 text-ink shadow-2xl backdrop:bg-black/50"
    >
      <h2 id="confirm-title" className="font-sans text-lg font-bold">
        {title}
      </h2>
      <p className="mt-2 text-sm text-ink-muted">{text}</p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} disabled={busy} className="min-h-11 rounded-md px-4 text-sm font-medium ring-1 ring-line hover:bg-surface-subtle">
          {a.delete.cancel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`min-h-11 rounded-md px-4 text-sm font-medium text-surface disabled:opacity-60 ${danger ? "bg-red-700 hover:bg-red-800" : "bg-brand-primary hover:bg-black"}`}
        >
          {busy ? a.delete.deleting : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
