import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap { return [{ url: "https://chartkit.dev", priority: 1 }, { url: "https://chartkit.dev/docs", priority: .8 }]; }
