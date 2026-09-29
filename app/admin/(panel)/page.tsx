import { redirect } from "next/navigation";
import { requireAdminPage } from "@/lib/server/auth";

/** /admin: the listings are the only section so far. */
export default async function AdminHome() {
  await requireAdminPage();
  redirect("/admin/properties");
}
