import type { Metadata } from "next";
import "@chartkit/internal/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://chartkit.dev"),
  title: { default: "ChartKit — Charts with a point of view", template: "%s · ChartKit" },
  description: "Polished, accessible React charts with eighteen chart families, three themes, and universal light and dark modes.",
  openGraph: { title: "ChartKit", description: "Charts with a point of view.", type: "website", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "ChartKit", description: "Charts with a point of view.", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-site-theme="light" data-scroll-behavior="smooth" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('chartkit-site-theme')||'light';document.documentElement.dataset.siteTheme=t;document.documentElement.style.colorScheme=t}catch(e){}})()` }} /></head><body>{children}</body></html>;
}
