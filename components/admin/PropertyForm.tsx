"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { AdminProperty } from "@/lib/server/properties";
import type { PropertyInput } from "@/lib/server/schemas";
import { locales, type Locale } from "@/i18n/config";
import { useHydrated } from "@/lib/use-hydrated";
import { AdminApiError, adminApi } from "./api";
import ConfirmDialog from "./ConfirmDialog";
import GroupedNumberInput from "./GroupedNumberInput";
import type { LatLng } from "./LeafletPicker";
import { inputClass } from "./LoginForm";
import { a } from "./strings";

// Leaflet needs `window`: load the map in the browser only.
const LeafletPicker = dynamic(() => import("./LeafletPicker"), { ssr: false });

type FormState = {
  translations: Record<Locale, { title: string; description: string }>;
  zone: string;
  type: string;
  status: string;
  areaSqm: string;
  price: string;
  priceOnRequest: boolean;
  municipality: string;
  feature: string;
  position: LatLng | null;
  featured: boolean;
  published: boolean;
};

function initialState(p?: AdminProperty): FormState {
  return {
    translations: p?.translations ?? { sq: { title: "", description: "" }, en: { title: "", description: "" }, de: { title: "", description: "" } },
    zone: p?.zone ?? "",
    type: p?.type ?? "land",
    status: p?.status ?? "sale",
    areaSqm: p ? String(p.areaSqm) : "",
    price: p?.price != null ? String(p.price) : "",
    priceOnRequest: p ? p.price === null : false,
    municipality: p?.municipality ?? "",
    feature: p?.feature ?? "",
    position: p ? { lat: p.lat, lng: p.lng } : null,
    featured: p?.featured ?? false,
    published: p?.published ?? true,
  };
}

/** Client-side checks for quick feedback only; the API validates everything again. */
function localErrors(s: FormState): Set<string> {
  const errors = new Set<string>();
  for (const l of locales) if (!s.translations[l].title.trim()) errors.add(`translations.${l}.title`);
  if (!s.zone) errors.add("zone");
  if (!s.feature) errors.add("feature");
  if (!s.municipality.trim()) errors.add("municipality");
  if (!(Number(s.areaSqm) > 0)) errors.add("areaSqm");
  if (!s.priceOnRequest && !/^\d+$/.test(s.price)) errors.add("price");
  if (!s.position) errors.add("lat");
  return errors;
}

function toPayload(s: FormState): PropertyInput {
  return {
    translations: s.translations,
    zone: s.zone,
    type: s.type as PropertyInput["type"],
    status: s.status as PropertyInput["status"],
    areaSqm: Number(s.areaSqm),
    price: s.priceOnRequest ? null : Number(s.price),
    lat: Number(s.position!.lat.toFixed(6)),
    lng: Number(s.position!.lng.toFixed(6)),
    municipality: s.municipality,
    feature: s.feature as PropertyInput["feature"],
    featured: s.featured,
    published: s.published,
  };
}

type Status = { kind: "idle" | "saving" | "saved" | "error"; message?: string };

/** Create / edit form for one listing (all three languages). Saves through the admin API. */
export default function PropertyForm({ property, justCreated = false }: { property?: AdminProperty; justCreated?: boolean }) {
  const router = useRouter();
  const [state, setState] = useState(() => initialState(property));
  const [tab, setTab] = useState<Locale>("sq");
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<Status>(justCreated ? { kind: "saved", message: a.form.created } : { kind: "idle" });
  const [dirty, setDirty] = useState(false);
  const hydrated = useHydrated();

  // Warn before leaving with unsaved changes: the browser's own prompt for closing or
  // reloading, and our dialog for links inside the site (which don't trigger that prompt).
  const [leaveTo, setLeaveTo] = useState<string | null>(null);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    const interceptLinks = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.origin !== window.location.origin) return;
      e.preventDefault();
      e.stopPropagation();
      setLeaveTo(link.pathname + link.search);
    };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", interceptLinks, true);
    return () => {
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("click", interceptLinks, true);
    };
  }, [dirty]);

  // Editing a field clears its error mark straight away.
  const clearErrors = (paths: string[]) =>
    setErrors((current) => (paths.some((p) => current.has(p)) ? new Set([...current].filter((e) => !paths.includes(e))) : current));

  const update = (patch: Partial<FormState>) => {
    setState((s) => ({ ...s, ...patch }));
    setDirty(true);
    if (status.kind === "saved") setStatus({ kind: "idle" });
    const keys = Object.keys(patch);
    clearErrors([
      ...keys,
      ...(keys.includes("position") ? ["lat", "lng"] : []),
      ...(keys.includes("priceOnRequest") ? ["price"] : []),
    ]);
  };
  const setTranslation = (field: "title" | "description", value: string) => {
    update({ translations: { ...state.translations, [tab]: { ...state.translations[tab], [field]: value } } });
    clearErrors([`translations.${tab}.${field}`]);
  };

  const bad = (path: string) => (errors.has(path) ? true : undefined);
  const tabHasError = (l: Locale) => [...errors].some((e) => e.startsWith(`translations.${l}`));

  async function save() {
    const found = localErrors(state);
    setErrors(found);
    if (found.size) {
      setStatus({ kind: "error", message: a.form.invalid });
      const firstLang = locales.find(tabHasErrorIn(found));
      if (firstLang) setTab(firstLang);
      return;
    }
    setStatus({ kind: "saving" });
    try {
      const payload = toPayload(state);
      if (property) {
        await adminApi(`/properties/${property.id}`, { method: "PATCH", json: payload });
        setDirty(false);
        setStatus({ kind: "saved", message: a.form.saved });
        router.refresh();
      } else {
        const created = await adminApi<AdminProperty>("/properties", { method: "POST", json: payload });
        setDirty(false);
        router.replace(`/admin/properties/${created.id}?created=1`);
      }
    } catch (error) {
      if (error instanceof AdminApiError && error.fields.length) {
        const serverErrors = new Set(error.fields);
        setErrors(serverErrors);
        const firstLang = locales.find(tabHasErrorIn(serverErrors));
        if (firstLang) setTab(firstLang);
        setStatus({ kind: "error", message: a.form.invalid });
      } else {
        setStatus({ kind: "error", message: a.form.error });
      }
    }
  }

  const section = "rounded-lg bg-surface p-4 ring-1 ring-line sm:p-6";
  const label = "text-sm font-medium";

  return (
    <form
      method="post"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (status.kind !== "saving") void save();
      }}
      className="space-y-6"
    >
      {/* Content in three languages */}
      <section className={section} aria-labelledby="content-heading">
        <h2 id="content-heading" className="font-sans text-lg font-bold">
          {a.form.content}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">{a.form.contentHint}</p>
        <div role="tablist" aria-label={a.form.content} className="mt-4 flex gap-1 border-b border-line">
          {locales.map((l) => (
            <button
              key={l}
              type="button"
              role="tab"
              id={`tab-${l}`}
              aria-selected={tab === l}
              aria-controls={`panel-${l}`}
              onClick={() => setTab(l)}
              className={`relative -mb-px inline-flex min-h-11 items-center gap-1.5 border-b-2 px-3 text-sm font-medium ${
                tab === l ? "border-brand-primary text-ink" : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              {a.form.languages[l]}
              {tabHasError(l) && <span aria-hidden className="size-2 rounded-full bg-red-600" />}
            </button>
          ))}
        </div>
        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-4 space-y-4">
          <div>
            <label htmlFor="f-title" className={label}>
              {a.form.title} ({a.form.languages[tab]})
            </label>
            <input
              id="f-title"
              value={state.translations[tab].title}
              onChange={(e) => setTranslation("title", e.target.value)}
              maxLength={160}
              aria-invalid={bad(`translations.${tab}.title`)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="f-description" className={label}>
              {a.form.description} ({a.form.languages[tab]})
            </label>
            <textarea
              id="f-description"
              value={state.translations[tab].description}
              onChange={(e) => setTranslation("description", e.target.value)}
              rows={7}
              maxLength={5000}
              aria-invalid={bad(`translations.${tab}.description`)}
              className={`${inputClass} resize-y py-2.5`}
            />
          </div>
        </div>
      </section>

      {/* Details */}
      <section className={section} aria-labelledby="details-heading">
        <h2 id="details-heading" className="font-sans text-lg font-bold">
          {a.form.details}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select id="f-zone" label={a.form.zone} value={state.zone} onChange={(zone) => update({ zone })} invalid={bad("zone")} placeholder="—"
            options={a.options.zones} />
          <div>
            <label htmlFor="f-municipality" className={label}>
              {a.form.municipality}
            </label>
            <input id="f-municipality" value={state.municipality} onChange={(e) => update({ municipality: e.target.value })} maxLength={80} aria-invalid={bad("municipality")} className={inputClass} />
          </div>
          <Select id="f-type" label={a.form.type} value={state.type} onChange={(type) => update({ type })} invalid={bad("type")}
            options={Object.entries(a.options.types).map(([value, l]) => ({ value, label: l }))} />
          <Select id="f-status" label={a.form.status} value={state.status} onChange={(s) => update({ status: s })} invalid={bad("status")}
            options={Object.entries(a.options.statuses).map(([value, l]) => ({ value, label: l }))} />
          <div>
            <label htmlFor="f-area" className={label}>
              {a.form.area}
            </label>
            <input id="f-area" type="number" inputMode="decimal" min="0" step="any" value={state.areaSqm} onChange={(e) => update({ areaSqm: e.target.value })} aria-invalid={bad("areaSqm")} className={inputClass} />
          </div>
          <div>
            <label htmlFor="f-price" className={label}>
              {a.form.price}
            </label>
            <GroupedNumberInput
              id="f-price"
              value={state.priceOnRequest ? "" : state.price}
              disabled={state.priceOnRequest}
              onChange={(price) => update({ price })}
              placeholder="0"
              aria-invalid={bad("price")}
              className={`${inputClass} disabled:bg-surface-subtle disabled:text-ink-muted`}
            />
            <label className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm">
              <input type="checkbox" checked={state.priceOnRequest} onChange={(e) => update({ priceOnRequest: e.target.checked })} className="size-5 accent-brand-primary" />
              {a.form.priceOnRequest}
            </label>
          </div>
          <Select id="f-feature" label={a.form.feature} value={state.feature} onChange={(feature) => update({ feature })} invalid={bad("feature")} placeholder="—"
            options={Object.entries(a.options.features).map(([value, l]) => ({ value, label: l }))} />
        </div>
      </section>

      {/* Location */}
      <section className={section} aria-labelledby="location-heading">
        <h2 id="location-heading" className="font-sans text-lg font-bold">
          {a.form.location}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">{a.form.locationHint}</p>
        <div
          role="region"
          aria-label={a.form.mapLabel}
          className={`relative isolate z-0 mt-4 h-72 overflow-hidden rounded-md bg-placeholder sm:h-96 ${errors.has("lat") || errors.has("lng") ? "ring-2 ring-red-600" : ""}`}
        >
          <p className="absolute inset-0 flex items-center justify-center text-sm text-ink-muted">{a.form.mapLoading}</p>
          <LeafletPicker value={state.position} onChange={(position) => update({ position })} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {(["lat", "lng"] as const).map((k) => (
            <div key={k}>
              <label htmlFor={`f-${k}`} className={label}>
                {a.form[k]}
              </label>
              <input
                id={`f-${k}`}
                type="number"
                inputMode="decimal"
                step="any"
                value={state.position ? state.position[k] : ""}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (e.target.value === "" || Number.isNaN(v)) return;
                  update({ position: { lat: state.position?.lat ?? 41.15, lng: state.position?.lng ?? 20.0, [k]: v } });
                }}
                aria-invalid={bad(k)}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Visibility */}
      <section className={section} aria-labelledby="visibility-heading">
        <h2 id="visibility-heading" className="font-sans text-lg font-bold">
          {a.form.visibility}
        </h2>
        <div className="mt-2 divide-y divide-line">
          <Toggle label={a.form.published} hint={a.form.publishedHint} checked={state.published} onChange={(published) => update({ published })} />
          <Toggle label={a.form.featured} hint={a.form.featuredHint} checked={state.featured} onChange={(featured) => update({ featured })} />
        </div>
      </section>

      {/* Save bar: stays in reach at the bottom of the screen while scrolling the form */}
      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border sm:px-6">
        <p
          role="status"
          className={`text-sm ${status.kind === "error" ? "text-red-700" : status.kind === "saved" ? "text-green-800" : "text-ink-muted"}`}
        >
          {status.message ?? ""}
        </p>
        <button
          type="submit"
          disabled={status.kind === "saving" || !hydrated}
          className="inline-flex min-h-11 items-center rounded-md bg-brand-primary px-5 font-medium text-surface transition-colors hover:bg-black disabled:opacity-60"
        >
          {status.kind === "saving" ? a.form.saving : property ? a.form.save : a.form.create}
        </button>
      </div>
      <ConfirmDialog
        open={leaveTo !== null}
        title={a.form.leaveTitle}
        text={a.form.leaveText}
        confirmLabel={a.form.leaveConfirm}
        danger={false}
        onConfirm={() => {
          const to = leaveTo!;
          setDirty(false);
          setLeaveTo(null);
          router.push(to);
        }}
        onCancel={() => setLeaveTo(null)}
      />
    </form>
  );
}

const tabHasErrorIn = (errors: Set<string>) => (l: Locale) => [...errors].some((e) => e.startsWith(`translations.${l}`));

function Select({
  id,
  label,
  value,
  onChange,
  options,
  invalid,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  invalid?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={invalid} className={inputClass}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-sm text-ink-muted">{hint}</span>
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className="relative h-7 w-12 shrink-0 rounded-full bg-ink-subtle transition-colors peer-checked:bg-brand-primary peer-focus-visible:ring-2 peer-focus-visible:ring-brand-primary peer-focus-visible:ring-offset-2 after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-surface after:transition-transform peer-checked:after:translate-x-5"
      />
    </label>
  );
}
