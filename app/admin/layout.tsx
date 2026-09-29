import type { Metadata } from "next";
import "../globals.css";
import { ego, gilmer } from "@/lib/fonts";
import { a } from "@/components/admin/strings";

// Separate root layout: the admin has no locale prefix and none of the public site chrome.
export const metadata: Metadata = {
  title: { default: a.panel, template: `%s | ${a.panel}` },
  // Never indexed, never followed.
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="sq" className={`${gilmer.variable} ${ego.variable} h-full antialiased`}>
      <body className="min-h-full overflow-x-clip bg-surface-subtle text-ink">{children}</body>
    </html>
  );
}
