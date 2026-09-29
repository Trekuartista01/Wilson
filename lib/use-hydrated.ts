"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * false in the server HTML and until React has taken over the page, true after.
 * Forms use it to keep their submit button disabled until their JavaScript handler is
 * attached: a click before that would do a plain browser submit (a page reload that loses
 * the input, and with GET puts the field values in the URL).
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
