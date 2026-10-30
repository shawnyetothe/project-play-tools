import type { Metadata } from "next";
import { GenerateExperience } from "@/components/generate/GenerateExperience";
import "./generate.css";

export const metadata: Metadata = {
  title: "Generate",
  description: "Sixteen pieces, one rule. Points orbit the circle. The seed decides the rest.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  openGraph: {
    title: "Generate · PlayTools",
    description: "Sixteen pieces, one rule. Points orbit the circle. The seed decides the rest.",
    images: [{ url: "/og/generate.png", width: 1200, height: 630, alt: "PlayTools Generate" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/generate.png"],
  },
};

export default function GeneratePage() {
  return <GenerateExperience />;
}
