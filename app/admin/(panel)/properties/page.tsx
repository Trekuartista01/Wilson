import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/server/auth";
import { listProperties } from "@/lib/server/properties";
import { listQuerySchema } from "@/lib/server/schemas";
import { a } from "@/components/admin/strings";
import PropertyManager from "@/components/admin/PropertyManager";

export const metadata: Metadata = { title: a.list.title };

const PAGE_SIZE = 20;

export default async function AdminPropertiesPage({ searchParams }: PageProps<"/admin/properties">) {
  await requireAdminPage();
  const raw = await searchParams;
  const parsed = listQuerySchema.safeParse({
    page: typeof raw.page === "string" ? raw.page : undefined,
    q: typeof raw.q === "string" && raw.q.trim() ? raw.q : undefined,
    pageSize: PAGE_SIZE,
  });
  const query = parsed.success ? parsed.data : { page: 1, pageSize: PAGE_SIZE, q: undefined };
  const result = await listProperties(query);
  return <PropertyManager {...result} q={query.q ?? ""} />;
}
