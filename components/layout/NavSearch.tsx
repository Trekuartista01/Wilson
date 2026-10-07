"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowUpRight, FiSearch, FiX } from "react-icons/fi";
import { format } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { filterSuggestions, type SearchSuggestion } from "@/lib/property-search";

type NavSearchProps = {
  labels: Dictionary["nav"];
  suggestions: SearchSuggestion[];
  /** The properties page; free text goes there as ?q=. */
  action: string;
  /** "bar": a pill in the desktop navbar that widens into the field. "menu": always open, in the mobile menu. */
  variant: "bar" | "menu";
  onOpenChange?: (open: boolean) => void;
};

/**
 * Navbar search (WAI-ARIA combobox). The suggestions are the usual real-estate searches
 * (popular searches, zones, types, what is close by, price and size), each opening the
 * properties page with those filters; anything else typed is a free-text search (?q=).
 * Arrow keys move through the list, Enter opens the highlighted entry, Escape closes.
 */
export default function NavSearch({ labels, suggestions, action, variant, onOpenChange }: NavSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const bar = variant === "bar";
  const [open, setOpen] = useState(!bar);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const [focused, setFocused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  // Tell the navbar (it fades its links while the field is open). In an effect, because the
  // field also closes during render after a navigation.
  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  // Close (and clear) after navigating elsewhere, e.g. a nav link.
  const [openedOn, setOpenedOn] = useState(pathname);
  if (openedOn !== pathname) {
    setOpenedOn(pathname);
    setQuery("");
    setActive(-1);
    if (bar && open) setOpen(false);
  }

  const matches = useMemo(() => filterSuggestions(suggestions, query), [suggestions, query]);
  const trimmed = query.trim();
  // The list: matching suggestions, then "Search for “…”" whenever something is typed.
  const options = useMemo(
    () => [
      ...matches.map((s) => ({ ...s, free: false })),
      ...(trimmed
        ? [{ label: format(labels.searchFor, { query: trimmed }), group: "", href: `${action}?${new URLSearchParams({ q: trimmed })}`, keywords: "", free: true }]
        : []),
    ],
    [matches, trimmed, labels.searchFor, action],
  );
  const showList = open && (bar || focused) && options.length > 0;

  useEffect(() => {
    if (!bar || !open) return;
    inputRef.current?.focus();
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [bar, open]);

  // Close and clear right away: a search from the properties page only changes the query
  // string, which the pathname check above doesn't see.
  const go = (href: string) => {
    router.push(href);
    inputRef.current?.blur();
    setQuery("");
    setActive(-1);
    if (bar) setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!options.length) return;
      // -1 is the field itself: down from the last entry or up from the first goes back to it.
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => {
        const next = i + step;
        if (next >= options.length) return -1;
        return next < -1 ? options.length - 1 : next;
      });
    } else if (e.key === "Escape") {
      if (query) setQuery("");
      else if (bar) setOpen(false);
      setActive(-1);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const picked = options[active];
    if (picked) go(picked.href);
    else if (trimmed) go(`${action}?${new URLSearchParams({ q: trimmed })}`);
  };

  const field = (
    <form role="search" action={action} onSubmit={onSubmit} className="flex h-full w-full items-center gap-2 pr-1.5 pl-4">
      <FiSearch aria-hidden className="size-5 shrink-0 opacity-70" />
      <input
        ref={inputRef}
        type="search"
        name="q"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        aria-label={labels.search}
        placeholder={labels.searchPlaceholder}
        autoComplete="off"
        enterKeyHint="search"
        maxLength={100}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(-1);
        }}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        // 16px on phones so iOS doesn't zoom into the field.
        className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-current placeholder:opacity-55 lg:text-sm [&::-webkit-search-cancel-button]:hidden"
      />
      {bar && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={labels.searchClose}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-surface/15"
        >
          <FiX aria-hidden className="size-4" />
        </button>
      )}
    </form>
  );

  const list = (
    <ul
      id={listId}
      role="listbox"
      aria-label={labels.searchSuggestions}
      // Keep focus in the field while clicking an entry.
      onMouseDown={(e) => e.preventDefault()}
      className={`overflow-y-auto overscroll-contain rounded-2xl bg-nav-dark/75 p-2 text-surface shadow-xl ring-1 ring-surface/15 backdrop-blur-xl ${
        bar ? "absolute inset-x-0 top-full mt-2 max-h-[min(28rem,calc(100svh-var(--header-h)-2rem))]" : "mt-2 max-h-80"
      }`}
    >
      {options.map((o, i) => (
        <li key={o.href} role="presentation">
          {o.group && o.group !== options[i - 1]?.group && (
            <p aria-hidden className="px-3 pt-2 pb-1 text-[0.7rem] tracking-[0.12em] text-surface/55 uppercase">
              {o.group}
            </p>
          )}
          <a
            id={`${listId}-${i}`}
            href={o.href}
            role="option"
            aria-selected={i === active}
            tabIndex={-1}
            onClick={(e) => {
              e.preventDefault();
              go(o.href);
            }}
            onMouseEnter={() => setActive(i)}
            className={`flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 text-sm ${
              i === active ? "bg-surface/15" : ""
            } ${o.free ? "mt-1 border-t border-surface/10 font-medium" : ""}`}
          >
            <span className="truncate">{o.label}</span>
            <FiArrowUpRight aria-hidden className="size-4 shrink-0 opacity-50" />
          </a>
        </li>
      ))}
    </ul>
  );

  if (!bar) {
    return (
      <div ref={rootRef}>
        <div className="h-12 rounded-full bg-surface/15 text-surface">{field}</div>
        {showList && list}
      </div>
    );
  }

  // The pill widens to the left over the nav links (which fade out, see Navbar) into the field.
  return (
    <div ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={labels.searchOpen}
        aria-expanded={open}
        className={`group inline-flex min-h-11 items-center ${open ? "invisible" : ""}`}
      >
        <span className="inline-flex h-9 w-13 items-center justify-center rounded-full bg-surface/20 backdrop-blur-sm transition-colors group-hover:bg-surface/35">
          <FiSearch aria-hidden className="size-5" />
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ width: "3.25rem", opacity: 0.6 }}
            animate={{ width: "100%", opacity: 1 }}
            exit={{ width: "3.25rem", opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-y-0 right-0 z-10 my-auto h-11 min-w-[18rem]"
          >
            <div className="h-full overflow-hidden rounded-full bg-surface/20 text-surface ring-1 ring-surface/25 backdrop-blur-md">{field}</div>
            {showList && list}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
