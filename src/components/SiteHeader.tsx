"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkspace } from "./workspace/Workspace";

const links = [
  { href: "/generate/", label: "Generate", num: "01" },
  { href: "/examples/", label: "Examples", num: "02" },
  { href: "/tools/", label: "Tools", num: "03" },
  { href: "/learn/", label: "Learn", num: "04" },
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
              <span className="nav-num">{link.num}</span>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
