"use client";

import { useId, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";
import Dropdown from "@/components/ui/Dropdown";

export type FilterName = "zone" | "type" | "status" | "area" | "price" | "sort";

export type FilterField = {
  name: FilterName;
  label: string;
  /** Label of the empty option ("all", "any"...). */
  placeholder: string;
  options: { value: string; label: string }[];
};

type FilterBarProps = {
  action: string;
  /** Always-visible dropdowns (Zona, Lloji, Statusi, Sipërfaqja). */
  fields: FilterField[];
  /** Extra dropdowns behind the "Më shumë" button. */
  moreFields: FilterField[];
  values: Partial<Record<FilterName, string>>;
  moreLabel: string;
  resetLabel: string;
  ariaLabel: string;
};

/**
 * Filter row on the properties page (Figma: outlined dropdowns). Each change updates the URL
 * straight away and goes back to the first page of results. The dropdowns are the site's own
 * styled list (components/ui/Dropdown), not the browser's native one.
 */
export default function FilterBar({
  action,
  fields,
  moreFields,
  values: initialValues,
  moreLabel,
  resetLabel,
  ariaLabel,
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

  const hasFilters = Object.values(initialValues).some(Boolean);

  function change(name: FilterName, value: string) {
    const next = { ...values, [name]: value };
    setValues(next);
    const params = new URLSearchParams();
    for (const field of [...fields, ...moreFields]) {
      const v = next[field.name];
      if (v) params.set(field.name, v);
    }
    const query = params.toString();
    startTransition(() => router.replace(`${action}${query ? `?${query}` : ""}`, { scroll: false }));
  }

  return (
    <div role="search" aria-label={ariaLabel} aria-busy={isPending}>
      <div className="flex flex-wrap items-center gap-3 sm:gap-5">
        {fields.map((field) => (
          <FilterSelect key={field.name} field={field} value={values[field.name] ?? ""} onChange={change} />
        ))}
        <button
          type="button"
          aria-expanded={moreOpen}
          aria-controls={panelId}
          onClick={() => setMoreOpen((v) => !v)}
          className={`${boxClass} hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink`}
        >
          {moreLabel}
          {moreActive > 0 && ` (${moreActive})`}
          <FiChevronDown aria-hidden className={`size-5 shrink-0 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
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

      <div id={panelId} hidden={!moreOpen} className="mt-3 sm:mt-4">
        <div className="flex flex-wrap gap-3 sm:gap-5">
          {moreFields.map((field) => (
            <FilterSelect key={field.name} field={field} value={values[field.name] ?? ""} onChange={change} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Figma: 1px dark outline, square corners, ~48px tall.
const boxClass =
  "relative inline-flex max-w-full min-h-12 items-center gap-2 rounded border border-ink/80 px-3.5 py-1.5 text-left text-base transition-colors sm:text-lg";

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
      className={`group ${boxClass} cursor-pointer hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink data-[open]:bg-ink/5`}
    >
      {/* e.g. "Zona: Tale" */}
      <span>
        {field.label}
        {selected && `: ${selected.label}`}
      </span>
      <FiChevronDown aria-hidden className="size-5 shrink-0 transition-transform group-data-[open]:rotate-180" />
    </Dropdown>
  );
}
