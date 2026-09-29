import Image from "next/image";
import Link from "next/link";
import { FiEdit2, FiExternalLink, FiPlus, FiSearch, FiStar } from "react-icons/fi";
import type { AdminProperty } from "@/lib/server/properties";
import { formatArea, formatDate, formatPrice } from "@/lib/format";
import { getZone, type ZoneSlug } from "@/data/properties";
import { a, fill } from "./strings";

type PropertyManagerProps = {
  items: AdminProperty[];
  page: number;
  pageSize: number;
  total: number;
  q: string;
};

/**
 * Admin listing overview: search, table (cards on phones), pagination and the entry
 * points to create and edit listings. Server-rendered; the search is a plain GET form.
 */
export default function PropertyManager({ items, page, pageSize, total, q }: PropertyManagerProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const pageHref = (n: number) => `/admin/properties?${new URLSearchParams({ ...(q ? { q } : {}), page: String(n) })}`;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">{a.list.title}</h1>
          <p className="mt-1 text-sm text-ink-muted">{fill(a.list.total, { total })}</p>
        </div>
        <Link
          href="/admin/properties/new"
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-brand-primary px-4 font-medium text-surface transition-colors hover:bg-black"
        >
          <FiPlus aria-hidden className="size-5" />
          {a.list.add}
        </Link>
      </div>

      <form method="get" role="search" className="mt-6 flex gap-2">
        <label htmlFor="admin-search" className="sr-only">
          {a.list.search}
        </label>
        <div className="relative min-w-0 flex-1">
          <FiSearch aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" />
          <input
            id="admin-search"
            name="q"
            defaultValue={q}
            maxLength={100}
            placeholder={a.list.search}
            className="block min-h-11 w-full rounded-md border border-line bg-surface pr-3 pl-9 text-base outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
          />
        </div>
        <button type="submit" className="min-h-11 rounded-md border border-ink/20 bg-surface px-4 text-sm font-medium hover:bg-surface-subtle">
          {a.list.searchButton}
        </button>
        {q && (
          <Link href="/admin/properties" className="inline-flex min-h-11 items-center px-2 text-sm underline underline-offset-4">
            {a.list.clearSearch}
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <p className="mt-8 rounded-lg bg-surface p-8 text-center text-ink-muted ring-1 ring-line">{q ? a.list.noResults : a.list.empty}</p>
      ) : (
        <ul className="mt-6 divide-y divide-line overflow-hidden rounded-lg bg-surface ring-1 ring-line">
          {/* Column headings (desktop only) */}
          <li aria-hidden className="hidden grid-cols-[4.5rem_minmax(0,1fr)_9rem_9rem_7rem_6rem] items-center gap-4 bg-surface-subtle px-4 py-2 text-xs font-medium tracking-wide text-ink-muted uppercase md:grid">
            <span>{a.list.photo}</span>
            <span>{a.list.listing}</span>
            <span>{a.list.price}</span>
            <span>{a.list.visibility}</span>
            <span>{a.list.updated}</span>
            <span />
          </li>
          {items.map((p) => (
            <li
              key={p.id}
              className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-2 px-4 py-3 md:grid-cols-[4.5rem_minmax(0,1fr)_9rem_9rem_7rem_6rem]"
            >
              <div className="relative row-span-2 aspect-[4/3] w-18 overflow-hidden rounded bg-placeholder md:row-span-1">
                {p.images[0] && <Image src={p.images[0].url} alt="" fill sizes="72px" className="object-cover" />}
              </div>
              <div className="min-w-0">
                <Link href={`/admin/properties/${p.id}`} className="block min-h-11 py-3 leading-5 font-medium hover:underline">
                  {p.translations.sq.title}
                </Link>
                <p className="-mt-2 truncate text-sm text-ink-muted">
                  {p.reference} · {getZone(p.zone as ZoneSlug).name.sq} · {formatArea("sq", p.areaSqm)}
                </p>
              </div>
              <p className="col-start-2 text-sm md:col-start-auto">
                {p.price === null ? a.form.priceOnRequest : formatPrice("sq", p.price)}
              </p>
              <div className="col-start-2 flex flex-wrap gap-1.5 md:col-start-auto">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    p.published ? "bg-green-100 text-green-800" : "bg-surface-muted text-ink-muted"
                  }`}
                >
                  {p.published ? a.list.published : a.list.hidden}
                </span>
                {p.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-accent/20 px-2 py-0.5 text-xs font-medium text-ink">
                    <FiStar aria-hidden className="size-3" />
                    {a.list.featured}
                  </span>
                )}
              </div>
              <p className="col-start-2 text-sm text-ink-muted md:col-start-auto">{formatDate("sq", p.updatedAt)}</p>
              <div className="col-start-2 flex gap-1 md:col-start-auto md:justify-end">
                <Link
                  href={`/admin/properties/${p.id}`}
                  aria-label={`${a.list.edit}: ${p.translations.sq.title}`}
                  className="inline-flex size-11 items-center justify-center rounded-md hover:bg-surface-subtle"
                >
                  <FiEdit2 aria-hidden className="size-4" />
                </Link>
                {p.published && (
                  <a
                    href={`/sq/properties/${p.slug}`}
                    target="_blank"
                    rel="noopener"
                    aria-label={`${a.list.view}: ${p.translations.sq.title}`}
                    className="inline-flex size-11 items-center justify-center rounded-md hover:bg-surface-subtle"
                  >
                    <FiExternalLink aria-hidden className="size-4" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <nav aria-label={fill(a.list.page, { page, pages })} className="mt-6 flex items-center justify-between gap-4 text-sm">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className="inline-flex min-h-11 items-center rounded-md px-3 ring-1 ring-line hover:bg-surface">
              {a.list.previous}
            </Link>
          ) : (
            <span />
          )}
          <span className="text-ink-muted">{fill(a.list.page, { page, pages })}</span>
          {page < pages ? (
            <Link href={pageHref(page + 1)} className="inline-flex min-h-11 items-center rounded-md px-3 ring-1 ring-line hover:bg-surface">
              {a.list.next}
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
