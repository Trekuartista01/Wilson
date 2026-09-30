import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/server/auth";
import { a } from "@/components/admin/strings";
import LoginForm from "@/components/admin/LoginForm";
import logo from "@/public/images/logo.png";

export const metadata: Metadata = { title: a.login.title };

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  // Already signed in: straight to the panel.
  if (await getAdminSession()) redirect("/admin/properties");
  const expired = (await searchParams).expired === "1";

  return (
    <main className="flex min-h-svh items-center justify-center bg-brand-dark px-4 py-10">
      <div className="w-full max-w-sm">
        <Image src={logo} alt="Wilson Real Estate" priority sizes="220px" className="mx-auto h-9 w-auto" />
        <div className="mt-8 rounded-lg bg-surface p-6 shadow-xl sm:p-8">
          <h1 className="text-2xl">{a.login.title}</h1>
          {expired && (
            <p role="status" className="mt-3 rounded-md bg-surface-subtle px-3 py-2 text-sm text-ink-muted">
              {a.login.expired}
            </p>
          )}
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
