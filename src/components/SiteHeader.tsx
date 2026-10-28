"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkspace } from "./workspace/Workspace";

const links = [
  { href: "/generate/", label: "Generate" },
  { href: "/examples/", label: "Examples" },
  { href: "/tools/", label: "Tools" },
  { href: "/learn/", label: "Learn" },
];

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const { href } = useWorkspace();
  return (
    <header className="site-header">
      <div className="header-bar">
        <Link href={href("/")} className="brand" aria-label="PlayTools">
          <img src="/logo-mark.svg" alt="" width={28} height={28} />
          <span>PlayTools</span>
        </Link>
        <nav className="nav-wide" aria-label="Primary">
          {links.map((link) => (
            <Link key={link.href} href={href(link.href)} aria-current={pathname === link.href || pathname.startsWith(link.href) ? "page" : undefined}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
