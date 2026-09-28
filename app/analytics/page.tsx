import type { Metadata } from "next";
import { AnalyticsDashboard } from "./dashboard";
import "./analytics.css";

// This export is a data-free shell. The hosting Worker gates its HTML and API.
export const metadata: Metadata = { title: "Private analytics", robots: { index: false, follow: false } };
export default function AnalyticsPage() { return <AnalyticsDashboard />; }
