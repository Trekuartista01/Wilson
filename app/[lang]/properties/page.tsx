import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import PropertiesPage, { PAGE_SIZE } from "@/components/pages/PropertiesPage";

export async function generateMetadata({ params }: PageProps<"/[lang]/properties">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.meta.properties.title, description: dict.meta.properties.description };
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** ?show= rounded up to a whole page, at least one page, capped so the URL can't ask for anything huge. */
function parseShow(value: string | undefined): number {
  const n = Math.ceil(Number(value) / PAGE_SIZE) * PAGE_SIZE;
  return Number.isFinite(n) ? Math.min(Math.max(n, PAGE_SIZE), 1000) : PAGE_SIZE;
}

export default async function Page({ params, searchParams }: PageProps<"/[lang]/properties">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, query] = await Promise.all([getDictionary(lang), searchParams]);

  const filters = {
    zone: first(query.zone),
    type: first(query.type),
    status: first(query.status),
    area: first(query.area),
    price: first(query.price),
    sort: first(query.sort),
  };

  return <PropertiesPage lang={lang} dict={dict} filters={filters} show={parseShow(first(query.show))} />;
}
