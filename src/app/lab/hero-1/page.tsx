import type { Metadata } from "next";
import { Prototype } from "@/components/lab/Prototype";

export const metadata: Metadata = { title: "Sketch and prompt" };

export default function Page() {
  return <Prototype which={1} />;
}
