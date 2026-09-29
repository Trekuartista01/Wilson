import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiExternalLink } from "react-icons/fi";
import { requireAdminPage } from "@/lib/server/auth";
import { ApiError } from "@/lib/server/errors";
import { getProperty } from "@/lib/server/properties";
import { uuidSchema } from "@/lib/server/schemas";
import { a } from "@/components/admin/strings";
import PropertyForm from "@/components/admin/PropertyForm";
import ImageManager from "@/components/admin/ImageManager";
import DeletePropertyButton from "@/components/admin/DeletePropertyButton";

export const metadata: Metadata = { title: a.form.editTitle };

async function load(id: string) {
  if (!uuidSchema.safeParse(id).success) notFound();
  try {
    return await getProperty(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export default async function EditPropertyPage({ params, searchParams }: PageProps<"/admin/properties/[id]">) {
  await requireAdminPage();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const property = await load(id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/properties" className="inline-flex min-h-11 items-center gap-2 text-sm text-ink-muted hover:text-ink">
          <FiArrowLeft aria-hidden />
          {a.form.back}
        </Link>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-ink-muted">
              {a.form.reference}: {property.reference}
            </p>
            <h1 className="mt-1 text-2xl break-words sm:text-3xl">{property.translations.sq.title}</h1>
          </div>
          {property.published && (
            <a
              href={`/sq/properties/${property.slug}`}
              target="_blank"
              rel="noopener"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm underline underline-offset-4"
            >
              {a.form.publicLink}
              <FiExternalLink aria-hidden className="size-4" />
            </a>
          )}
        </div>
      </div>

      <ImageManager propertyId={property.id} images={property.images} title={property.translations.sq.title} />
      {/* After a save the form already holds what was saved, so it keeps its own state
          (and its "saved" message) instead of being re-created from the refreshed data. */}
      <PropertyForm property={property} justCreated={query.created === "1"} />

      <div className="flex justify-end border-t border-line pt-6">
        <DeletePropertyButton propertyId={property.id} />
      </div>
    </div>
  );
}
