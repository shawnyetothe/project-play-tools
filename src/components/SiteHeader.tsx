"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogoLockup } from "./LogoLockup";

const links = [
  { href: "/tools/", label: "Tools" },
  { href: "/artists/", label: "Artists" },
  { href: "/recipes/", label: "Examples" },
  { href: "/#play", label: "Start making" },
  { href: "/abx/", label: "Publish" },
];

function isCurrent(pathname: string, href: string) {
  if (href.includes("#")) return false;
  const path = href.replace(/\/$/, "") || "/";
  return pathname === href || pathname === path || pathname.startsWith(`${path}/`);
}

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-bar">
        <Link href="/" className="brand" aria-label="PlayTools">
          <LogoLockup />
        </Link>
        <nav className="nav-wide" aria-label="Primary">
          {links.map((link) => (
            <Link key={link.href} href={link.href} aria-current={isCurrent(pathname, link.href) ? "page" : undefined}>
              {link.label}
            </Link>
          ))}
        </nav>
        <details
          className="nav-small"
          open={open}
          onToggle={(event) => setOpen(event.currentTarget.open)}
        >
          <summary
            onClick={(event) => {
              event.preventDefault();
              setOpen((value) => !value);
            }}
          >
            Menu
          </summary>
          <nav aria-label="Primary">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isCurrent(pathname, link.href) ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
