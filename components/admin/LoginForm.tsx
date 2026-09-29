"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useHydrated } from "@/lib/use-hydrated";
import { a } from "./strings";

export const inputClass =
  "mt-1.5 block min-h-11 w-full rounded-md border border-line bg-surface px-3 text-base text-ink outline-none transition-colors focus:border-brand-primary focus:ring-1 focus:ring-brand-primary aria-invalid:border-red-600 aria-invalid:ring-1 aria-invalid:ring-red-600";

/** Admin sign-in. The server checks the password, sets the httpOnly cookie and rate limits. */
export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const hydrated = useHydrated();

  async function submit(form: HTMLFormElement) {
    const data = new FormData(form);
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: data.get("username"), password: data.get("password") }),
      });
      if (response.ok) {
        // The server components of the panel render with the new cookie.
        router.replace("/admin/properties");
        router.refresh();
        return;
      }
      setError(response.status === 429 ? a.login.rateLimited : response.status === 401 ? a.login.invalid : a.form.error);
    } catch {
      setError(a.form.error);
    }
    setSubmitting(false);
  }

  return (
    // POST, and the button waits for JavaScript: the password can never end up in a URL.
    <form
      method="post"
      className="mt-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!submitting) void submit(e.currentTarget);
      }}
    >
      <div>
        <label htmlFor="admin-username" className="text-sm font-medium">
          {a.login.username}
        </label>
        <input id="admin-username" name="username" autoComplete="username" required maxLength={100} className={inputClass} aria-invalid={error ? true : undefined} />
      </div>
      <div>
        <label htmlFor="admin-password" className="text-sm font-medium">
          {a.login.password}
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={200}
          className={inputClass}
          aria-invalid={error ? true : undefined}
        />
      </div>
      <p role="alert" className="min-h-5 text-sm text-red-700">
        {error}
      </p>
      <button
        type="submit"
        disabled={submitting || !hydrated}
        className="flex min-h-12 w-full items-center justify-center rounded-md bg-brand-primary px-4 font-medium text-surface transition-colors hover:bg-black disabled:opacity-60"
      >
        {submitting ? a.login.submitting : a.login.submit}
      </button>
    </form>
  );
}
