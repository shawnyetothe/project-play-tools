import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ExploreClient } from "./ExploreClient";

export const metadata: Metadata = { title: "Explore the data" };

export default function ExplorePage() {
  return (
    <div className="wrap">
      <p className="quiet">
        <Link href="/">Home</Link> / Explore the data
      </p>
      <h1>Explore the data</h1>
      <p>
        Artists, projects, the maturity map, whitespace, and usage counts. The home page stays on making. This is the table layer.
      </p>
      <p className="quiet">
        Filters need JavaScript. The <Link href="/artists/">artist index</Link> and <Link href="/tools/">tool index</Link> work without it.
      </p>
      <Suspense fallback={<p>Loading the tables…</p>}>
        <ExploreClient />
      </Suspense>
    </div>
  );
}
