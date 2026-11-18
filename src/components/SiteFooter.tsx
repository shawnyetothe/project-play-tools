"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { SuggestForm } from "./SuggestForm";

function cleanPath(path: string) {
  const trimmed = path.replace(/\/$/, "");
  return trimmed || "/";
}

function PoweredBy() {
  return (
    <p className="abx-credit">
      <a href="https://www.artblocks.io" data-testid="abx-credit">
        Powered by ABX · inspired by Art Blocks
      </a>
    </p>
  );
}

function Disclaimer({ pulledLabel }: { pulledLabel: string }) {
  return (
    <>
      <p>
        Names and projects come from the public Art Blocks API, pulled {pulledLabel}. Artists are not featured beyond that record without consent.
      </p>
      <p>PlayTools is an independent project, not affiliated with Art Blocks.</p>
      <p className="quiet">Private preview. Search engines are asked not to index this site.</p>
      <PoweredBy />
    </>
  );
}

export function SiteFooter({
  pulledLabel,
  makePaths,
  recipes,
}: {
  pulledLabel: string;
  makePaths: { slug: string; plain: string }[];
  recipes: { slug: string; plain: string }[];
}) {
  const path = cleanPath(usePathname() || "/");
  const workspace = path === "/" || ["/generate", "/examples", "/tools", "/learn"].some((item) => path === item || path.startsWith(`${item}/`));
  const lab = path === "/lab" || path.startsWith("/lab/");
  const map = path === "/sitemap" || path.startsWith("/sitemap/");

  if (workspace || lab || map) {
    return (
      <footer className="site-footer">
        <p className="footer-minis">
          <Link href="/lab/suggest/">Suggest a tool, example, or fix</Link>
          <Link href="/sitemap/">Site map</Link>
        </p>
        <Disclaimer pulledLabel={pulledLabel} />
      </footer>
    );
  }

  return (
    <footer className="site-footer">
      <Suspense fallback={<p>Loading the suggestion form…</p>}>
        <SuggestForm />
      </Suspense>
      <p>
        Names and projects come from the public Art Blocks API, pulled {pulledLabel}. Artists are not featured beyond that record without consent.
      </p>
      <p>PlayTools is an independent project, not affiliated with Art Blocks.</p>
      <nav className="sitemap" aria-label="Site map">
        <h2>Site map</h2>
        <div className="sitemap-grid">
          <div>
            <h3>Begin</h3>
            <ul className="link-list">
              <li>
                <Link href="/#play">Play</Link>
              </li>
              <li>
                <Link href="/start/">Start here</Link>
              </li>
              <li>
                <Link href="/abx/">ABX</Link>
              </li>
              <li>
                <Link href="/explore/">Explore the data</Link>
              </li>
              <li>
                <Link href="/about/">About</Link>
              </li>
              <li>
                <a href="?suggest=removal#suggest">Request removal</a>
              </li>
            </ul>
          </div>
          <div>
            <h3>Make</h3>
            <ul className="link-list">
                {makePaths.map((item) => (
                <li key={item.slug}>
                  <Link href={`/make/${item.slug}/`}>{item.plain}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Recipes</h3>
            <ul className="link-list">
              <li>
                <Link href="/recipes/">All recipes</Link>
              </li>
                {recipes.map((recipe) => (
                <li key={recipe.slug}>
                  <Link href={`/recipes/${recipe.slug}/`}>{recipe.plain}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Indexes</h3>
            <ul className="link-list">
              <li>
                <Link href="/tools/">Tools</Link>
              </li>
              <li>
                <Link href="/artists/">Artists</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <p className="quiet">Private preview. Search engines are asked not to index this site.</p>
      <PoweredBy />
    </footer>
  );
}
