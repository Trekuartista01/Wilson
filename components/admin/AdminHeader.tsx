import Image from "next/image";
import Link from "next/link";
import { FiExternalLink } from "react-icons/fi";
import logo from "@/public/images/logo.png";
import { a } from "./strings";
import LogoutButton from "./LogoutButton";

export default function AdminHeader({ username }: { username: string }) {
  return (
    <header className="sticky top-0 z-40 bg-brand-dark text-surface">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2 sm:px-6">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link href="/admin/properties" aria-label={a.panel} className="inline-flex min-h-11 items-center">
            <Image src={logo} alt="" priority sizes="160px" className="h-6 w-auto sm:h-7" />
          </Link>
          <nav aria-label={a.panel}>
            <Link href="/admin/properties" className="inline-flex min-h-11 items-center text-sm font-medium underline decoration-brand-accent decoration-2 underline-offset-8">
              {a.nav.properties}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-1 sm:gap-3">
          <span className="hidden text-sm text-surface/70 md:inline">
            {a.nav.signedInAs} <span className="text-surface">{username}</span>
          </span>
          <a
            href="/sq"
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-11 items-center gap-1.5 px-2 text-sm text-surface/80 hover:text-surface"
          >
            {a.nav.viewSite}
            <FiExternalLink aria-hidden className="size-4" />
          </a>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
