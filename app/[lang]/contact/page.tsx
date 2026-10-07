import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getPublishedProperties } from "@/lib/server/catalog";
import ContactPage from "@/components/pages/ContactPage";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.meta.contact.title, description: dict.meta.contact.description };
}

export default async function Page({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, all] = await Promise.all([getDictionary(lang), getPublishedProperties()]);
  const properties = all.map((p) => ({ slug: p.slug, label: `${p.title[lang]} (${p.reference})` }));
  return <ContactPage lang={lang} dict={dict} properties={properties} />;
}
