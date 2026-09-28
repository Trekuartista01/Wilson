import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getProperty, properties } from "@/data/properties";
import SinglePageOfProperty from "@/components/pages/SinglePageOfProperty";

// Only the placeholder listings exist; any other slug is a 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/properties/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const property = getProperty(slug);
  if (!hasLocale(lang) || !property) return {};
  return { title: property.title[lang], description: property.description[lang] };
}

export default async function Page({ params }: PageProps<"/[lang]/properties/[slug]">) {
  const { lang, slug } = await params;
  const property = getProperty(slug);
  if (!hasLocale(lang) || !property) notFound();
  const dict = await getDictionary(lang);
  return <SinglePageOfProperty property={property} lang={lang} dict={dict} />;
}
