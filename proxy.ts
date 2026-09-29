import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, defaultLocale, hasLocale, locales, type Locale } from "@/i18n/config";
import { SESSION_COOKIE } from "@/lib/session-cookie";

/** Picks the best supported locale from the Accept-Language header. */
function localeFromHeader(header: string | null): Locale | null {
  if (!header) return null;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { lang } of ranked) {
    if (hasLocale(lang)) return lang;
  }
  return null;
}

/**
 * Admin panel (/admin, no locale prefix): a quick first check only. Without a session
 * cookie, go straight to the login page. The real verification (signature, expiry) happens
 * in every admin page (requireAdminPage) and API route (requireAdmin).
 */
function adminGate(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return;
  if (!request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) return adminGate(request);

  const hasPrefix = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasPrefix) return;

  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale =
    (cookieLocale && hasLocale(cookieLocale) ? cookieLocale : null) ??
    localeFromHeader(request.headers.get("accept-language")) ??
    defaultLocale;

  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip API routes, Next internals and any path with a file extension (public assets).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
