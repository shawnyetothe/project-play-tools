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
        Artists on this site come from the public Art Blocks record, pulled {meta.pulledLabel}. We do not feature anyone beyond that record without consent.
      </p>
      <p className="links">
        <Link href="/about/">How to read this</Link>
        <a href="?suggest=removal#suggest">Request removal</a>
        <a href="#suggest">Suggest a fix</a>
      </p>
    </footer>
  );
}
