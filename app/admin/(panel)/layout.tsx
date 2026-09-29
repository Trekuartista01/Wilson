import { requireAdminPage } from "@/lib/server/auth";
import AdminHeader from "@/components/admin/AdminHeader";

/** Everything behind the login. Each page below also checks the session itself. */
export default async function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireAdminPage();
  return (
    <>
      <AdminHeader username={session.username} />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">{children}</main>
    </>
  );
}
