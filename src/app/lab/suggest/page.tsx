import type { Metadata } from "next";
import { Suspense } from "react";
import { SuggestForm } from "@/components/SuggestForm";

export const metadata: Metadata = { title: "Suggest a tool, example, or fix" };

export default function SuggestPage() {
  return (
    <div className="wrap lab-page">
      <Suspense fallback={<p>Loading the suggestion form…</p>}>
        <SuggestForm />
      </Suspense>
    </div>
  );
}
