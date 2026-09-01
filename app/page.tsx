import { Suspense } from "react";
import { Gallery } from "./components/gallery";

export default function HomePage() {
  return <Suspense fallback={<main className="loading-shell">Loading ChartKit…</main>}><Gallery /></Suspense>;
}
