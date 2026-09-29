"use client";

import { useRouter } from "next/navigation";
import { FiLogOut } from "react-icons/fi";
import { adminApi } from "./api";
import { a } from "./strings";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await adminApi("/logout", { method: "POST" }).catch(() => undefined);
        router.replace("/admin/login");
        router.refresh();
      }}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 text-sm text-surface/80 transition-colors hover:bg-surface/10 hover:text-surface"
    >
      <FiLogOut aria-hidden className="size-4" />
      {a.nav.logout}
    </button>
  );
}
