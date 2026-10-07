"use client";

import { useId, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiChevronDown, FiX } from "react-icons/fi";
import Dropdown from "@/components/ui/Dropdown";

export type FilterName = "zone" | "type" | "status" | "area" | "near" | "price" | "sort";

export type FilterField = {
  name: FilterName;
  label: string;
  /** Label of the empty option ("all", "any"...). */
  placeholder: string;
  options: { value: string; label: string }[];
};

type FilterBarProps = {
  action: string;
  /** Always-visible dropdowns (Zona, Lloji, Statusi, Sipërfaqja, Afër). */
  fields: FilterField[];
  /** Extra dropdowns behind the "Më shumë" button. */
  moreFields: FilterField[];
  values: Partial<Record<FilterName, string>>;
  moreLabel: string;
  resetLabel: string;
  ariaLabel: string;
  /** Free text from the navbar search (?q=), kept while the dropdowns change. */
  query?: string;
  queryLabel: string;
  clearQueryLabel: string;
};

/**
 * Filter row on the properties page. Each change updates the URL straight away and goes back
 * to the first page of results. The dropdowns are the site's own styled list
 * (components/ui/Dropdown), not the browser's native one, styled like the navbar pills:
 * translucent gray, dark once a value is picked. A navbar search shows as a removable chip.
 */
export default function FilterBar({
  action,
  fields,
  moreFields,
  values: initialValues,
  moreLabel,
  resetLabel,
  ariaLabel,
  query,
  queryLabel,
  clearQueryLabel,
}: FilterBarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState(initialValues);
  const moreActive = moreFields.filter((f) => initialValues[f.name]).length;
  const [moreOpen, setMoreOpen] = useState(moreActive > 0);
  const panelId = useId();

  // Keep the selects in sync when the URL changes elsewhere (e.g. "Clear filters").
  const [synced, setSynced] = useState(initialValues);
  if (JSON.stringify(synced) !== JSON.stringify(initialValues)) {
    setSynced(initialValues);
    setValues(initialValues);
  }

  const hasFilters = Object.values(initialValues).some(Boolean) || Boolean(query);

  function navigate(next: Partial<Record<FilterName, string>>, q: string | undefined) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    for (const field of [...fields, ...moreFields]) {
      const v = next[field.name];
      if (v) params.set(field.name, v);
    }
    const search = params.toString();
    startTransition(() => router.replace(`${action}${search ? `?${search}` : ""}`, { scroll: false }));
  }

  function change(name: FilterName, value: string) {
    const next = { ...values, [name]: value };
    setValues(next);
    navigate(next, query);
  }

  return (
    <div role="search" aria-label={ariaLabel} aria-busy={isPending}>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {query && (
          <button
            type="button"
            onClick={() => navigate(values, undefined)}
            aria-label={clearQueryLabel}
            className={`${boxClass} ${selectedClass} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink`}
          >
            <span className="max-w-[16rem] truncate">{queryLabel}</span>
            <FiX aria-hidden className="size-4 shrink-0" />
          </button>
        )}
        {fields.map((field) => (
          <FilterSelect key={field.name} field={field} value={values[field.name] ?? ""} onChange={change} />
        ))}
        <button
          type="button"
          aria-expanded={moreOpen}
          aria-controls={panelId}
          onClick={() => setMoreOpen((v) => !v)}
          className={`${boxClass} ${moreActive > 0 || moreOpen ? selectedClass : idleClass} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink`}
        >
          {moreLabel}
          {moreActive > 0 && ` (${moreActive})`}
          <FiChevronDown aria-hidden className={`size-4 shrink-0 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
        </button>
        {hasFilters && (
          <Link
            href={action}
            scroll={false}
            className="inline-flex min-h-11 items-center text-sm underline underline-offset-4 hover:text-ink-muted"
          >
            {resetLabel}
          </Link>
        )}
      </div>

      <div id={panelId} hidden={!moreOpen} className="mt-2 sm:mt-3">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {moreFields.map((field) => (
            <FilterSelect key={field.name} field={field} value={values[field.name] ?? ""} onChange={change} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Pills like the navbar links: translucent gray with a blur, solid dark once a value is set.
const boxClass =
  "relative inline-flex max-w-full min-h-11 items-center gap-2 rounded-full px-4 py-1.5 text-left text-sm whitespace-nowrap backdrop-blur-sm transition-colors sm:text-[0.95rem]";
const idleClass = "bg-nav-dark/10 text-ink hover:bg-nav-dark/20";
const selectedClass = "bg-nav-dark text-surface hover:bg-nav-dark/90";

function FilterSelect({
  field,
  value,
  onChange,
}: {
  field: FilterField;
  value: string;
  onChange: (name: FilterName, value: string) => void;
}) {
  const selected = field.options.find((o) => o.value === value);
  return (
    <Dropdown
      name={field.name}
      label={field.label}
      placeholder={field.placeholder}
      options={field.options}
      value={value}
      onChange={(v) => onChange(field.name, v)}
      className={`group ${boxClass} ${selected ? selectedClass : `${idleClass} data-[open]:bg-nav-dark/20`} cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink`}
    >
      {/* e.g. "Zona: Tale" */}
      <span>
        {field.label}
        {selected && `: ${selected.label}`}
      </span>
      <FiChevronDown aria-hidden className="size-4 shrink-0 transition-transform group-data-[open]:rotate-180" />
    </Dropdown>
  );
}
