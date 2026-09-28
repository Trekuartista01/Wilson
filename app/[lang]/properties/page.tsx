import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import PropertiesPage from "@/components/pages/PropertiesPage";

export async function generateMetadata({ params }: PageProps<"/[lang]/properties">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.meta.properties.title, description: dict.meta.properties.description };
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function Page({ params, searchParams }: PageProps<"/[lang]/properties">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, query] = await Promise.all([getDictionary(lang), searchParams]);

  const filters = {
    zone: first(query.zone),
    type: first(query.type),
    area: first(query.area),
    status: first(query.status),
  };

  return <PropertiesPage lang={lang} dict={dict} filters={filters} />;
}
