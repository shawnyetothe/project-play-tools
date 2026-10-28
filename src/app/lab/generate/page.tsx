import type { Metadata } from "next";
import dynamic from "next/dynamic";
import "../generate.css";

const GenerateApp = dynamic(() => import("@/components/lab/GenerateApp").then((mod) => mod.GenerateApp), {
  loading: () => <p className="wrap">Opening the darkroom.</p>,
});

export const metadata: Metadata = { title: "Generate" };

export default function GeneratePage() {
  return <GenerateApp />;
}
