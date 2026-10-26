import Link from "next/link";
import { suggestEmail } from "@/lib/site";
import { LogoLockup } from "./LogoLockup";

const feedbackHref = suggestEmail
  ? `mailto:${suggestEmail}?subject=${encodeURIComponent("Play Tools: did this open the right tool?")}&body=${encodeURIComponent("The message I tried:\n\nThe tool it opened:\n\nThe tool I would have handed them:\n")}`
  : "";

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
      <p className="banner">
        Private preview. Not approved for public release. Search engines are asked not to index this site.{" "}
        <Link href="/#play">Start from one place in Play</Link>
        {feedbackHref ? (
          <>
            , then <a href={feedbackHref}>email whether that tool is the one you would have handed them</a>
          </>
        ) : null}
        . <Link href="/about/">About</Link> explains a gap such as “No verified image yet.”
      </p>
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
