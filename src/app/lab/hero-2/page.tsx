import type { Metadata } from "next";
import { Prototype } from "@/components/lab/Prototype";

export const metadata: Metadata = { title: "Lineage" };

export default function Page() {
  return <Prototype which={2} />;
}
