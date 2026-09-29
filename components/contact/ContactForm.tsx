"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type ContactFormProps = {
  lang: Locale;
  labels: Dictionary["contactPage"]["form"];
};

type Status = "idle" | "sending" | "success" | "invalid" | "rateLimited" | "error";

const inputClass =
  "mt-1.5 block min-h-12 w-full rounded-md border border-line bg-surface px-3 text-base text-ink outline-none transition-colors focus:border-brand-primary focus:ring-1 focus:ring-brand-primary aria-invalid:border-red-600 aria-invalid:ring-1 aria-invalid:ring-red-600";

/**
 * Contact form, posted to /api/contact (validated, rate limited and emailed on the server).
 * The browser's required/maxLength checks are only there for quick feedback.
 */
export default function ContactForm({ lang, labels }: ContactFormProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [invalid, setInvalid] = useState<Set<string>>(new Set());

  async function submit(form: HTMLFormElement) {
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      subject: String(data.get("subject") ?? ""),
      message: String(data.get("message") ?? ""),
      consent: data.get("consent") === "on",
      locale: lang,
      website: String(data.get("website") ?? ""),
    };

    setStatus("sending");
    setInvalid(new Set());
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        form.reset();
        setStatus("success");
        return;
      }
      if (response.status === 429) return setStatus("rateLimited");
      if (response.status === 400) {
        const body = await response.json().catch(() => null);
        const fields: { path: string }[] = body?.error?.fields ?? [];
        setInvalid(new Set(fields.map((f) => f.path.split(".")[0])));
        return setStatus("invalid");
      }
      setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  const bad = (name: string) => (invalid.has(name) ? true : undefined);
  const sending = status === "sending";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!sending) void submit(e.currentTarget);
      }}
      aria-busy={sending}
      className="grid grid-cols-1 gap-5 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <label htmlFor="contact-name" className="text-sm font-medium">
          {labels.name}
        </label>
        <input id="contact-name" name="name" type="text" autoComplete="name" required maxLength={100} aria-invalid={bad("name")} className={inputClass} />
      </div>
      <div>
        <label htmlFor="contact-email" className="text-sm font-medium">
          {labels.email}
        </label>
        <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} aria-invalid={bad("email")} className={inputClass} />
      </div>
      <div>
        <label htmlFor="contact-phone" className="text-sm font-medium">
          {labels.phone}
        </label>
        <input id="contact-phone" name="phone" type="tel" autoComplete="tel" maxLength={30} aria-invalid={bad("phone")} className={inputClass} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="contact-subject" className="text-sm font-medium">
          {labels.subject}
        </label>
        <select id="contact-subject" name="subject" className={inputClass} defaultValue="general" aria-invalid={bad("subject")}>
          {Object.entries(labels.subjects).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="contact-message" className="text-sm font-medium">
          {labels.message}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          required
          minLength={10}
          maxLength={3000}
          aria-invalid={bad("message")}
          className={`${inputClass} resize-y py-3`}
        />
      </div>

      {/* Honeypot: hidden from people and screen readers; bots that fill it get ignored. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex gap-3 sm:col-span-2">
        <input
          id="contact-consent"
          name="consent"
          type="checkbox"
          required
          aria-invalid={bad("consent")}
          className="mt-0.5 size-5 shrink-0 accent-brand-primary"
        />
        <label htmlFor="contact-consent" className="text-sm text-ink-muted">
          {labels.consent}
        </label>
      </div>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={sending}
          className="inline-flex min-h-12 w-full items-center justify-center bg-brand-primary px-6 text-surface transition-colors hover:bg-black disabled:opacity-60 sm:w-auto"
        >
          {sending ? labels.sending : labels.submit}
        </button>
        <p
          role="status"
          className={`mt-3 text-sm ${status === "success" ? "text-ink" : status === "idle" || sending ? "text-ink-muted" : "text-red-700"}`}
        >
          {status === "idle" || sending ? "" : labels[status]}
        </p>
      </div>
    </form>
  );
}
