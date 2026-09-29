import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSimilarProperties } from "@/data/properties";
import { getPublishedProperties, getPublishedProperty } from "@/lib/server/catalog";
import SinglePageOfProperty from "@/components/pages/SinglePageOfProperty";

// Listings live in Supabase: pages for listings that exist at build time are prerendered,
// new ones render on first visit. Unknown or unpublished slugs are a 404.
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getPublishedProperties()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/properties/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const property = await getPublishedProperty(slug);
  if (!hasLocale(lang) || !property) return {};
  return { title: property.title[lang], description: property.description[lang] };
}

export default async function Page({ params }: PageProps<"/[lang]/properties/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, all] = await Promise.all([getDictionary(lang), getPublishedProperties()]);
  const property = all.find((p) => p.slug === slug);
  if (!property) notFound();
  return <SinglePageOfProperty property={property} similar={getSimilarProperties(all, property)} lang={lang} dict={dict} />;
}
