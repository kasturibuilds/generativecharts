"use client";

import { useEffect, useState } from "react";
import { ThemeIcon } from "./theme-icon";

export function AppearanceToggle() {
  const [appearance, setAppearance] = useState<"light" | "dark">("light");
  useEffect(() => { const timer = window.setTimeout(() => setAppearance(document.documentElement.dataset.siteTheme === "dark" ? "dark" : "light"), 0); return () => window.clearTimeout(timer); }, []);
  function toggle() {
    const next = appearance === "light" ? "dark" : "light";
    setAppearance(next);
    document.documentElement.dataset.siteTheme = next;
    document.documentElement.style.colorScheme = next;
    try { localStorage.setItem("chartkit-site-theme", next); } catch { /* Storage may be disabled. */ }
  }
  return <button aria-label={`Switch to ${appearance === "light" ? "dark" : "light"} mode`} className="theme-toggle" onClick={toggle} type="button"><ThemeIcon appearance={appearance} /></button>;
}
