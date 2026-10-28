import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./lab.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <div className={`lab ${display.variable}`}>{children}</div>;
}
