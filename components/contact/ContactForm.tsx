"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";

type ContactFormProps = {
  labels: Dictionary["contactPage"]["form"];
};

const inputClass =
  "mt-1.5 block min-h-12 w-full rounded-md border border-line bg-surface px-3 text-base text-ink outline-none transition-colors focus:border-brand-primary focus:ring-1 focus:ring-brand-primary";

/**
 * Contact form UI only (Phase 1). Browser validation attributes are UX, not security.
 * TODO (Milestone 2): POST to an API route with server-side validation, rate limiting
 * and nodemailer delivery.
 */
export default function ContactForm({ labels }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="grid grid-cols-1 gap-5 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <label htmlFor="contact-name" className="text-sm font-medium">
          {labels.name}
        </label>
        <input id="contact-name" name="name" type="text" autoComplete="name" required maxLength={100} className={inputClass} />
      </div>
      <div>
        <label htmlFor="contact-email" className="text-sm font-medium">
          {labels.email}
        </label>
        <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={200} className={inputClass} />
      </div>
      <div>
        <label htmlFor="contact-phone" className="text-sm font-medium">
          {labels.phone}
        </label>
        <input id="contact-phone" name="phone" type="tel" autoComplete="tel" maxLength={30} className={inputClass} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="contact-subject" className="text-sm font-medium">
          {labels.subject}
        </label>
        <select id="contact-subject" name="subject" className={inputClass} defaultValue="general">
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
          maxLength={3000}
          className={`${inputClass} resize-y py-3`}
        />
      </div>
      <div className="flex gap-3 sm:col-span-2">
        <input
          id="contact-consent"
          name="consent"
          type="checkbox"
          required
          className="mt-0.5 size-5 shrink-0 accent-brand-primary"
        />
        <label htmlFor="contact-consent" className="text-sm text-ink-muted">
          {labels.consent}
        </label>
      </div>
      <div className="sm:col-span-2">
        <button
          type="submit"
          className="inline-flex min-h-12 w-full items-center justify-center bg-brand-primary px-6 text-surface transition-colors hover:bg-black sm:w-auto"
        >
          {labels.submit}
        </button>
        <p role="status" className="mt-3 text-sm text-ink-muted">
          {submitted ? labels.notConnected : ""}
        </p>
      </div>
    </form>
  );
}
