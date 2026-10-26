import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Newsreader } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const sans = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
});

const serif = Newsreader({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: {
    default: "Play Tools",
    template: "%s · Play Tools",
  },
  description:
    "A private guide to digital creative tools. Data comes from the public Art Blocks API. Independent project, not affiliated with Art Blocks.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
