"use client";

import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { useHydrated } from "@/lib/use-hydrated";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type ContactFormProps = {
  lang: Locale;
  labels: Dictionary["contactPage"]["form"];
  /** Published listings for the "Property" select. */
  properties: { slug: string; label: string }[];
};

type Status = "idle" | "sending" | "success" | "invalid" | "rateLimited" | "error";

// Underlined fields on the dark hero ("image.png" reference, 2026-10-06): the field name sits
// in the field as uppercase placeholder text (the <label> is there for screen readers).
const inputClass =
  "block min-h-14 w-full border-0 border-b border-surface/30 bg-transparent px-0 text-base text-surface outline-none transition-colors placeholder:text-surface/85 placeholder:uppercase hover:border-surface/60 focus:border-brand-cta aria-invalid:border-red-400";

/**
 * Contact form, posted to /api/contact (validated, rate limited and emailed on the server).
 * The browser's required/maxLength checks are only there for quick feedback.
 */
export default function ContactForm({ lang, labels, properties }: ContactFormProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [invalid, setInvalid] = useState<Set<string>>(new Set());
  const hydrated = useHydrated();

  async function submit(form: HTMLFormElement) {
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      // No topic picker in this layout; the property select says what it is about.
      subject: "general",
      property: String(data.get("property") ?? ""),
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
    // POST, and the button waits for JavaScript: personal data never goes into a URL.
    <form
      method="post"
      onSubmit={(e) => {
        e.preventDefault();
        if (!sending) void submit(e.currentTarget);
      }}
      aria-busy={sending}
      className="flex flex-col gap-3"
    >
      <div>
        <label htmlFor="contact-name" className="sr-only">
          {labels.name}
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          maxLength={100}
          placeholder={labels.name}
          aria-invalid={bad("name")}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="contact-phone" className="sr-only">
          {labels.phone}
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          maxLength={30}
          placeholder={labels.phone}
          aria-invalid={bad("phone")}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="sr-only">
          {labels.email}
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          placeholder={labels.email}
          aria-invalid={bad("email")}
          className={inputClass}
        />
      </div>
      {properties.length > 0 && (
        <div className="relative">
          <label htmlFor="contact-property" className="sr-only">
            {labels.property}
          </label>
          <select
            id="contact-property"
            name="property"
            defaultValue=""
            aria-invalid={bad("property")}
            className={`${inputClass} appearance-none pr-8 uppercase [&_option]:bg-nav-dark [&_option]:normal-case`}
          >
            <option value="">{`${labels.property} — ${labels.propertyNone}`}</option>
            {properties.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.label}
              </option>
            ))}
          </select>
          <FiChevronDown
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-0 size-4 -translate-y-1/2 text-surface/70"
          />
        </div>
      )}
      <div>
        <label htmlFor="contact-message" className="sr-only">
          {labels.message}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={3}
          required
          minLength={10}
          maxLength={3000}
          placeholder={labels.messagePlaceholder}
          aria-invalid={bad("message")}
          className={`${inputClass} resize-y py-4`}
        />
      </div>

      {/* Honeypot: hidden from people and screen readers; bots that fill it get ignored. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-5 flex items-start gap-3">
        <input
          id="contact-consent"
          name="consent"
          type="checkbox"
          required
          aria-invalid={bad("consent")}
          className="mt-0.5 size-5 shrink-0 accent-brand-cta"
        />
        <label htmlFor="contact-consent" className="text-sm text-surface/70">
          {labels.consent}
        </label>
      </div>
      <div className="mt-6">
        <button
          type="submit"
          disabled={sending || !hydrated}
          className="inline-flex min-h-14 min-w-44 items-center justify-center rounded-tr-btn rounded-bl-btn bg-surface px-10 text-sm tracking-[0.1em] text-ink uppercase transition-colors hover:bg-brand-cta disabled:opacity-60"
        >
          {sending ? labels.sending : labels.submit}
        </button>
        <p
          role="status"
          className={`mt-3 text-sm ${status === "success" ? "text-surface" : status === "idle" || sending ? "text-surface/60" : "text-red-300"}`}
        >
          {status === "idle" || sending ? "" : labels[status]}
        </p>
      </div>
    </form>
  );
}
