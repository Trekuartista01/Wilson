import Link from "next/link";
import { lang } from "next/root-params";
import { defaultLocale, hasLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import Container from "@/components/ui/Container";

/** Localized 404, rendered inside the shared Header/Footer layout. */
export default async function NotFound() {
  const current = await lang();
  const locale = hasLocale(current) ? current : defaultLocale;
  const t = (await getDictionary(locale)).notFound;

  return (
    <Container className="flex flex-col items-start py-24 sm:py-32">
      <title>{t.title}</title>
      <p className="text-sm font-medium text-ink-muted">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">{t.title}</h1>
      <p className="mt-4 max-w-md text-ink-muted">{t.text}</p>
      <Link
        href={localePath(locale)}
        className="mt-8 inline-flex min-h-12 items-center bg-brand-primary px-5 text-surface hover:bg-black"
      >
        {t.cta}
      </Link>
    </Container>
  );
}
