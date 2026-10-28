import type { Metadata } from "next";
import "./lab.css";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <div className="lab">{children}</div>;
}
