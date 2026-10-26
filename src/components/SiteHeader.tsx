import Link from "next/link";

const links = [
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
      <p className="banner">
        Private preview. Not approved for public release. Search engines are asked not to index this site.
      </p>
      <div className="header-bar">
        <Link href="/" className="brand">
          <img src="/logo.svg" alt="" width={40} height={40} />
          <span>Art Blocks Toolmakers</span>
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
