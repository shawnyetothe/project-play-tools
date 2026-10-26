import Link from "next/link";
import { LogoLockup } from "./LogoLockup";

const links = [
  { href: "/#play", label: "Play" },
  { href: "/start/", label: "Start here" },
  { href: "/tools/", label: "Tools" },
  { href: "/artists/", label: "Artists" },
  { href: "/recipes/", label: "Recipes" },
  { href: "/abx/", label: "ABX" },
  { href: "/explore/", label: "Explore the data" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-bar">
        <Link href="/" className="brand" aria-label="Play Tools">
          <LogoLockup />
        </Link>
        <nav className="nav-wide" aria-label="Primary">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <details className="nav-small">
          <summary>Menu</summary>
          <nav aria-label="Primary">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
