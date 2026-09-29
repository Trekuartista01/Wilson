"use client";

import { useLayoutEffect, useRef } from "react";

/** "185000" -> "185,000" */
export const groupDigits = (digits: string) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

type GroupedNumberInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
  /** Digits only, e.g. "185000". */
  value: string;
  onChange: (digits: string) => void;
  maxDigits?: number;
};

/**
 * Whole-number input that shows thousands separators while typing ("185,000") but hands
 * back plain digits. The cursor stays next to the digit being typed, and Backspace on a
 * comma deletes the digit before it.
 */
export default function GroupedNumberInput({ value, onChange, maxDigits = 11, ...rest }: GroupedNumberInputProps) {
  const ref = useRef<HTMLInputElement>(null);
  // Where the cursor should go after re-render, counted in digits from the left.
  const caret = useRef<number | null>(null);
  const display = groupDigits(value);

  useLayoutEffect(() => {
    const input = ref.current;
    if (caret.current === null || !input || document.activeElement !== input) return;
    let pos = 0;
    for (let seen = 0; pos < display.length && seen < caret.current; pos++) {
      if (/\d/.test(display[pos])) seen++;
    }
    input.setSelectionRange(pos, pos);
    caret.current = null;
  });

  return (
    <input
      {...rest}
      ref={ref}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={display}
      onChange={(e) => {
        const raw = e.target.value;
        const cursor = e.target.selectionStart ?? raw.length;
        let digits = raw.replace(/\D/g, "");
        let before = raw.slice(0, cursor).replace(/\D/g, "").length;
        // Only a comma was deleted: delete the digit in front of it instead.
        if (digits === value && raw.length < display.length && before > 0) {
          digits = value.slice(0, before - 1) + value.slice(before);
          before -= 1;
        }
        digits = digits.replace(/^0+(?=\d)/, "").slice(0, maxDigits);
        caret.current = Math.min(before, digits.length);
        onChange(digits);
      }}
    />
  );
}
