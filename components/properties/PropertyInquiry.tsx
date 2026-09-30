"use client";

import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiPhone } from "react-icons/fi";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { useHydrated } from "@/lib/use-hydrated";

type PropertyInquiryProps = {
  lang: Locale;
  labels: Dictionary["property"]["inquiry"];
  company: string;
  slug: string;
  reference: string;
  priceLabel: string;
  price: string;
  /** Prefilled message ("Jam i interesuar për Tale — Parcelë 8,400 m²."). */
  defaultMessage: string;
  whatsappHref: string;
  phoneHref: string;
};

type Status = "idle" | "sending" | "success" | "invalid" | "rateLimited" | "error";

const fieldClass =
  "mt-1 block w-full border-b border-ink/40 bg-transparent py-2 text-base text-ink outline-none transition-colors focus:border-brand-brown aria-invalid:border-red-600";

/**
 * Contact card on a listing page ("Pronat - New Colors" mockup): WhatsApp and phone buttons,
 * then a short enquiry form posted to /api/inquiry (validated, rate limited and emailed on
 * the server). The message comes prefilled with the listing's name.
 */
export default function PropertyInquiry({
  lang,
  labels,
  company,
  slug,
  reference,
  priceLabel,
  price,
  defaultMessage,
  whatsappHref,
  phoneHref,
}: PropertyInquiryProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [invalid, setInvalid] = useState<Set<string>>(new Set());
  const hydrated = useHydrated();

  async function submit(form: HTMLFormElement) {
    const data = new FormData(form);
    const payload = {
      property: slug,
      name: String(data.get("name") ?? ""),
      phone: String(data.get("phone") ?? ""),
      message: String(data.get("message") ?? ""),
      locale: lang,
      website: String(data.get("website") ?? ""),
    };

    setStatus("sending");
    setInvalid(new Set());
    try {
      const response = await fetch("/api/inquiry", {
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
  const button = "flex min-h-11 w-full items-center justify-center gap-2 rounded px-4 text-base";

  return (
    <div className="bg-surface-raised p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:p-8">
      <p className="text-base">{company}</p>
      <p className="mt-0.5 text-xs text-ink-muted">
        {labels.reference} {reference}
      </p>
      <p className="mt-4 text-sm text-ink-muted">{priceLabel}</p>
      <p className="text-xl font-semibold">{price}</p>

      <div className="mt-5 space-y-3">
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={`${button} bg-brand-brown text-surface`}>
          <FaWhatsapp aria-hidden className="size-5" />
          {labels.whatsapp}
        </a>
        <a href={phoneHref} className={`${button} border border-ink/80 text-ink transition-colors hover:bg-ink/5`}>
          <FiPhone aria-hidden />
          {labels.call}
        </a>
      </div>

      {/* POST, and the button waits for JavaScript: personal data never goes into a URL. */}
      <form
        method="post"
        onSubmit={(e) => {
          e.preventDefault();
          if (!sending) void submit(e.currentTarget);
        }}
        aria-busy={sending}
        className="mt-6 space-y-6 border-t border-divider pt-6"
      >
        <div>
          <label htmlFor="inquiry-name" className="text-xs tracking-wide uppercase">
            {labels.name}
          </label>
          <input id="inquiry-name" name="name" type="text" autoComplete="name" required maxLength={100} aria-invalid={bad("name")} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="inquiry-phone" className="text-xs tracking-wide uppercase">
            {labels.phone}
          </label>
          <input
            id="inquiry-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            minLength={6}
            maxLength={30}
            aria-invalid={bad("phone")}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="inquiry-message" className="text-xs tracking-wide uppercase">
            {labels.message}
          </label>
          <textarea
            id="inquiry-message"
            name="message"
            rows={3}
            required
            maxLength={3000}
            defaultValue={defaultMessage}
            aria-invalid={bad("message")}
            className={`${fieldClass} resize-y text-sm`}
          />
        </div>

        {/* Honeypot: hidden from people and screen readers; bots that fill it get ignored. */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="inquiry-website">Website</label>
          <input id="inquiry-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div>
          <button type="submit" disabled={sending || !hydrated} className={`${button} bg-brand-brown text-surface disabled:opacity-60`}>
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
    </div>
  );
}
