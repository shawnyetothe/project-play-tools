import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Bricolage_Grotesque, JetBrains_Mono, Newsreader } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { KeyHints } from "@/components/workspace/Keys";
import { PhoneNav, Tray, WorkspaceProvider } from "@/components/workspace/Workspace";
import { meta } from "@/lib/data";
import "./globals.css";
import "./workspace.css";

const sans = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
});

const serif = Newsreader({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-newsreader",
  preload: false,
});

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "optional",
  preload: false,
  variable: "--font-bricolage",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: "400",
  display: "optional",
  preload: false,
  variable: "--font-mono-jb",
});

export const metadata: Metadata = {
  title: {
    default: "PlayTools",
    template: "%s · PlayTools",
  },
  description:
    "A private guide to digital creative tools. Data comes from the public Art Blocks API. Independent project, not affiliated with Art Blocks.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f5f2",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${display.variable} ${mono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var arm="a";try{arm=localStorage.getItem("playtools-arm")||"";if(arm!=="a"&&arm!=="b"){var b=new Uint8Array(1);crypto.getRandomValues(b);arm=b[0]<128?"a":"b";localStorage.setItem("playtools-arm",arm);}}catch(e){arm="a";}document.documentElement.dataset.arm=arm;})();`,
          }}
        />
        <meta property="og:title" content="PlayTools" />
        <meta
          property="og:description"
          content="A private guide to digital creative tools. Data comes from the public Art Blocks API. Independent project, not affiliated with Art Blocks."
        />
        <meta property="og:image" content="/playtools-og-image-1200x630.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="PlayTools" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="/playtools-og-image-1200x630.png" />
      </head>
      <body>
        <WorkspaceProvider>
          <a className="skip" href="#main">
            Skip to content
          </a>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter
            pulledLabel={meta.pulledLabel}
            makePaths={meta.paths.map((item) => ({ slug: item.slug, plain: item.plain }))}
            recipes={meta.recipes.map((item) => ({ slug: item.slug, plain: item.plain }))}
          />
          <Tray />
          <PhoneNav />
          <KeyHints />
        </WorkspaceProvider>
      </body>
    </html>
  );
}
