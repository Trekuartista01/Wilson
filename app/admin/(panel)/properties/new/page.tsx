import type { Metadata } from "next";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { requireAdminPage } from "@/lib/server/auth";
import { a } from "@/components/admin/strings";
import PropertyForm from "@/components/admin/PropertyForm";

export const metadata: Metadata = { title: a.form.newTitle };

export default async function NewPropertyPage() {
  await requireAdminPage();
  return (
    <div>
      <Link href="/admin/properties" className="inline-flex min-h-11 items-center gap-2 text-sm text-ink-muted hover:text-ink">
        <FiArrowLeft aria-hidden />
        {a.form.back}
      </Link>
      <h1 className="mt-2 mb-6 text-3xl">{a.form.newTitle}</h1>
      {/* Photos can be added once the listing exists (they need its id). */}
      <PropertyForm />
    </div>
  );
}
