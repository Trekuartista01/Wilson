"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";

export type SearchField = {
  name: "zone" | "type" | "area" | "status";
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
};

type SearchFormProps = {
  action: string;
  fields: SearchField[];
  values: Partial<Record<SearchField["name"], string>>;
  submitLabel: string;
  ariaLabel: string;
  /** Apply each change straight away (properties page) instead of waiting for the button. */
  applyOnChange?: boolean;
  className?: string;
};

/**
 * The interactive part of the search bar. Submitting goes to the properties list with only
 * the chosen filters in the URL and jumps to the results. Still a plain GET form, so it
 * works without JavaScript too.
 */
export default function SearchForm({
  action,
  fields,
  values: initialValues,
  submitLabel,
  ariaLabel,
  applyOnChange = false,
  className = "",
}: SearchFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState(initialValues);

  // Keep the selects in sync when the URL changes elsewhere (e.g. "Clear filters").
  const [synced, setSynced] = useState(initialValues);
  if (JSON.stringify(synced) !== JSON.stringify(initialValues)) {
    setSynced(initialValues);
    setValues(initialValues);
  }

  function go(next: typeof values) {
    const params = new URLSearchParams();
    for (const field of fields) {
      const value = next[field.name];
      if (value) params.set(field.name, value);
    }
    const query = params.toString();
    const url = `${action}${query ? `?${query}` : ""}`;
    startTransition(() => {
      if (applyOnChange) router.replace(url, { scroll: false });
      else router.push(`${url}#results`);
    });
  }

  return (
    <form
      action={action}
      method="get"
      role="search"
      aria-label={ariaLabel}
      aria-busy={isPending}
      onSubmit={(event) => {
        event.preventDefault();
        go(values);
      }}
      className={`grid grid-cols-1 bg-surface text-ink shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-1 ring-line sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_minmax(8rem,0.9fr)] ${className}`}
    >
      {fields.map((field) => (
        <div
          key={field.name}
          className="relative border-b border-line px-4 py-3 sm:odd:border-r lg:border-r lg:border-b-0 lg:px-5 lg:py-4"
        >
          <label htmlFor={`search-${field.name}`} className="block text-sm font-medium">
            {field.label}
          </label>
          <div className="relative mt-1">
            <select
              id={`search-${field.name}`}
              name={field.name}
              value={values[field.name] ?? ""}
              onChange={(event) => {
                const next = { ...values, [field.name]: event.target.value };
                setValues(next);
                if (applyOnChange) go(next);
              }}
              className={`min-h-11 w-full cursor-pointer appearance-none bg-transparent pr-8 text-base outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                values[field.name] ? "text-ink" : "text-ink-muted"
              }`}
            >
              <option value="">{field.placeholder}</option>
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FiChevronDown
              aria-hidden
              className="pointer-events-none absolute top-1/2 right-1 size-4 -translate-y-1/2 text-ink-muted"
            />
          </div>
        </div>
      ))}
      <button
        type="submit"
        disabled={isPending}
        className="min-h-14 px-6 text-base font-medium transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-primary disabled:opacity-60 sm:col-span-2 lg:col-span-1"
      >
        {submitLabel}
      </button>
    </form>
  );
}
