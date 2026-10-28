import type { Metadata } from "next";
import { examples } from "@/lib/examples";
import { ExampleList } from "@/components/workspace/ExampleList";

export const metadata: Metadata = { title: "Examples" };

export default function ExamplesPage() {
  return (
    <div className="workspace wrap">
      <h1>Examples</h1>
      <p>Original sketches in this guide. Outside work is named and linked. Nothing here is a redraw of someone else’s piece.</p>
      <ExampleList items={examples} />
    </div>
  );
}
