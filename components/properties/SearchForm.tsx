"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiArrowRight, FiChevronDown } from "react-icons/fi";
import Dropdown from "@/components/ui/Dropdown";

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
  /** "hero": frosted bar over the homepage photo, each cell shows only its field name. */
  variant?: "default" | "hero";
  className?: string;
};

const styles = {
  default: {
    form: "grid-cols-1 bg-surface text-ink shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-1 ring-line sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_minmax(8rem,0.9fr)]",
    cell: "border-b border-line px-4 py-3 sm:odd:border-r lg:border-r lg:border-b-0 lg:px-5 lg:py-4",
    label: "block text-sm font-medium",
    selectWrap: "relative mt-1",
    select: "min-h-11 justify-between gap-2 text-left text-base",
    empty: "text-ink-muted",
    chevron: "text-ink-muted",
    submit: "min-h-14 font-medium hover:bg-surface-subtle focus-visible:outline-brand-primary sm:col-span-2 lg:col-span-1",
  },
  hero: {
    // Phones: the four fields share one row above a slim Kërko row, so the bar stays short.
    form: "grid-cols-4 overflow-hidden rounded bg-black/30 text-surface shadow-[0_8px_30px_rgba(0,0,0,0.15)] backdrop-blur-md lg:grid-cols-[repeat(4,minmax(0,1fr))_minmax(8.5rem,1.1fr)]",
    cell: "border-r border-surface/15",
    label: "sr-only",
    selectWrap: "relative",
    select:
      "min-h-11 justify-center px-0.5 text-center text-xs hover:bg-surface/10 data-[open]:bg-surface/10 sm:min-h-14 sm:px-4 sm:text-[15px] lg:min-h-15 lg:text-base",
    empty: "text-surface",
    chevron: "hidden",
    submit:
      "col-span-4 min-h-11 gap-2 bg-brand-brown font-medium text-surface hover:bg-brand-brown/90 focus-visible:outline-surface sm:min-h-14 sm:gap-3 lg:col-span-1 lg:min-h-15",
  },
};

/**
 * The interactive part of the search bar. Submitting goes to the properties list with only
 * the chosen filters in the URL and jumps to the results. The dropdowns are the site's own
 * styled list (components/ui/Dropdown); each keeps a hidden input, so it's still a GET form.
 */
export default function SearchForm({
  action,
  fields,
  values: initialValues,
  submitLabel,
  ariaLabel,
  variant = "default",
  className = "",
}: SearchFormProps) {
  const style = styles[variant];
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
      router.push(`${url}#results`);
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
      className={`grid ${style.form} ${className}`}
    >
      {fields.map((field) => (
        <div key={field.name} className={`relative ${style.cell}`}>
          {/* Visible label for the default look; the dropdown carries its own accessible name. */}
          <span aria-hidden className={style.label}>
            {field.label}
          </span>
          <div className={style.selectWrap}>
            <Dropdown
              name={field.name}
              label={field.label}
              placeholder={field.placeholder}
              options={field.options}
              value={values[field.name] ?? ""}
              onChange={(value) => setValues({ ...values, [field.name]: value })}
              align={variant === "hero" ? "center" : "start"}
              className={`group flex w-full cursor-pointer items-center bg-transparent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset ${
                variant === "hero" ? "focus-visible:ring-surface" : "focus-visible:ring-brand-primary"
              } ${style.select} ${values[field.name] ? "" : style.empty}`}
            >
              {/* Hero: with nothing chosen the cell reads as the field name ("Zona"), like the mockup. */}
              <span className="truncate">
                {field.options.find((o) => o.value === values[field.name])?.label ??
                  (variant === "hero" ? field.label : field.placeholder)}
              </span>
              <FiChevronDown
                aria-hidden
                className={`size-4 shrink-0 transition-transform group-data-[open]:rotate-180 ${style.chevron}`}
              />
            </Dropdown>
          </div>
        </div>
      ))}
      <button
        type="submit"
        disabled={isPending}
        className={`inline-flex items-center justify-center px-6 text-base transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 disabled:opacity-60 ${style.submit}`}
      >
        {submitLabel}
        {variant === "hero" && <FiArrowRight aria-hidden className="size-5" />}
      </button>
    </form>
  );
}
