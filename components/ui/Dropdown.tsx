"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import { useHydrated } from "@/lib/use-hydrated";

export type DropdownOption = { value: string; label: string };

type DropdownProps = {
  /** Name of the hidden input, so a surrounding <form> still submits the value. */
  name: string;
  /** Accessible name ("Zona"). */
  label: string;
  /** Label of the empty choice ("Të gjitha"), always listed first. */
  placeholder: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  /** Classes for the trigger button; its content is `children`. */
  className?: string;
  /** Where the list opens relative to the trigger. */
  align?: "start" | "center";
  children: React.ReactNode;
};

type Position = { left: number; minWidth: number; top?: number; bottom?: number };

const LIST_MAX_HEIGHT = 288; // max-h-72

/**
 * Styled replacement for a native <select> (the browser's own option list can't be styled).
 * Follows the WAI-ARIA "select-only combobox" pattern: focus stays on the trigger, arrow keys
 * move through the options (aria-activedescendant), Enter or Space picks, Escape closes, and
 * typing a letter jumps to the next option starting with it. The list is rendered in a portal
 * so a parent's overflow or rounded corners can't clip it; it opens upwards when there's no
 * room below, and closes on outside click, page scroll or resize.
 */
export default function Dropdown({
  name,
  label,
  placeholder,
  options,
  value,
  onChange,
  className = "",
  align = "start",
  children,
}: DropdownProps) {
  const all: DropdownOption[] = [{ value: "", label: placeholder }, ...options];
  const selectedIndex = Math.max(0, all.findIndex((o) => o.value === value));

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(selectedIndex);
  const [position, setPosition] = useState<Position | null>(null);
  const hydrated = useHydrated(); // the list lives in a portal on <body>: browser only
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();
  const listId = `${id}-list`;
  const optionId = (i: number) => `${id}-option-${i}`;

  function show() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const left = align === "center" ? rect.left + rect.width / 2 : rect.left;
    const minWidth = Math.max(rect.width, 192); // at least 12rem, so short triggers get a roomy list
    const roomBelow = window.innerHeight - rect.bottom;
    setPosition(
      roomBelow < LIST_MAX_HEIGHT + 16 && rect.top > roomBelow
        ? { left, minWidth, bottom: window.innerHeight - rect.top + 8 }
        : { left, minWidth, top: rect.bottom + 8 },
    );
    setActive(selectedIndex);
    setOpen(true);
  }

  function choose(index: number) {
    const option = all[index];
    if (option && option.value !== value) onChange(option.value);
    setOpen(false);
  }

  // Close on outside click, page scroll (not the list's own scroll) and resize.
  useEffect(() => {
    if (!open) return;
    const inside = (target: EventTarget | null) =>
      target instanceof Node && (triggerRef.current?.contains(target) || listRef.current?.contains(target));
    const onPointer = (e: PointerEvent) => !inside(e.target) && setOpen(false);
    const onScroll = (e: Event) => !inside(e.target) && setOpen(false);
    const onResize = () => setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  // Keep the highlighted option visible when moving with the keyboard.
  useEffect(() => {
    if (open) document.getElementById(`${id}-option-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, id]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        show();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => Math.min(i + 1, all.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(all.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(active);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        // Type-ahead: jump to the next option starting with the typed letter.
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const letter = e.key.toLocaleLowerCase();
          for (let step = 1; step <= all.length; step++) {
            const i = (active + step) % all.length;
            if (all[i].label.toLocaleLowerCase().startsWith(letter)) {
              setActive(i);
              break;
            }
          }
        }
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? optionId(active) : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
        className={className}
        data-open={open || undefined}
      >
        {children}
      </button>
      <input type="hidden" name={name} value={value} />

      {hydrated &&
        createPortal(
          <AnimatePresence>
            {open && position && (
              <motion.ul
                ref={listRef}
                id={listId}
                role="listbox"
                aria-label={label}
                initial={{ opacity: 0, y: position.top !== undefined ? -4 : 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                style={{
                  position: "fixed",
                  left: position.left,
                  top: position.top,
                  bottom: position.bottom,
                  minWidth: position.minWidth,
                  translateX: align === "center" ? "-50%" : 0,
                }}
                className="z-[60] max-h-72 w-max max-w-[min(22rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded bg-surface py-1.5 text-ink shadow-[0_12px_32px_rgba(0,0,0,0.14)] ring-1 ring-divider"
              >
                {all.map((option, i) => {
                  const selected = i === selectedIndex;
                  return (
                    <li
                      key={option.value || "__empty"}
                      id={optionId(i)}
                      role="option"
                      aria-selected={selected}
                      // Keep focus on the trigger when clicking an option.
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => choose(i)}
                      className={`flex min-h-11 cursor-pointer items-center justify-between gap-6 px-4 text-left text-base ${
                        i === active ? "bg-surface-card" : ""
                      } ${selected ? "font-medium text-brand-brown" : option.value === "" ? "text-ink-muted" : ""}`}
                    >
                      {option.label}
                      {selected && <FiCheck aria-hidden className="size-4 shrink-0" />}
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
