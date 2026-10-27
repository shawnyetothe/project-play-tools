import Link from "next/link";
import { Suspense } from "react";
import { meta } from "@/lib/data";
import { SuggestForm } from "./SuggestForm";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Suspense fallback={<p>Loading the suggestion form…</p>}>
        <SuggestForm />
      </Suspense>
      <p>
        Names and projects come from the public Art Blocks API, pulled {meta.pulledLabel}. Artists are not featured beyond that record without consent.
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
              {meta.paths.map((path) => (
                <li key={path.slug}>
                  <Link href={`/make/${path.slug}/`}>{path.plain}</Link>
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
              {meta.recipes.map((recipe) => (
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
    </footer>
  );
}
