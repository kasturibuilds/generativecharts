import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_URL } from "./lib/site";
import "generative-charts/styles.css";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Generative Charts — Charts with a point of view", template: "%s · Generative Charts" },
  description: "Polished, accessible React charts with eighteen chart families, three themes, and universal light and dark modes.",
  openGraph: { title: "Generative Charts", siteName: "Generative Charts", description: "Charts with a point of view.", type: "website", images: [{ url: "/social-card.png", width: 1200, height: 630, type: "image/png", alt: "Generative Charts — 18 React chart families, 3 expressive themes." }] },
  twitter: { card: "summary_large_image", title: "Generative Charts", description: "Charts with a point of view.", images: [{ url: "/social-card.png", alt: "Generative Charts — 18 React chart families, 3 expressive themes." }] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-site-theme="dark" data-scroll-behavior="smooth" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: `(function(){var t='dark';try{var saved=localStorage.getItem('chartkit-site-theme');if(location.pathname!=='/'&&(saved==='light'||saved==='dark'))t=saved}catch(e){}var mode=new URLSearchParams(location.search).get('mode');if(mode==='light'||mode==='dark')t=mode;document.documentElement.dataset.siteTheme=t;document.documentElement.style.colorScheme=t})()` }} /></head><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}
