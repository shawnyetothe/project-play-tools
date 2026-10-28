import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./lab.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "optional",
  adjustFontFallback: true,
  fallback: ["system-ui", "sans-serif"],
  variable: "--font-bricolage",
  axes: ["opsz"],
  preload: false,
});

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <div className={`lab ${display.variable}`}>{children}</div>;
}
