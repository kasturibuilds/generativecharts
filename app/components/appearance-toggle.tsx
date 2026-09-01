"use client";

import { useEffect, useState } from "react";

export function AppearanceToggle() {
  const [appearance, setAppearance] = useState<"light" | "dark">("light");
  useEffect(() => { const timer = window.setTimeout(() => setAppearance(document.documentElement.dataset.siteTheme === "dark" ? "dark" : "light"), 0); return () => window.clearTimeout(timer); }, []);
  function toggle() {
    const next = appearance === "light" ? "dark" : "light";
    setAppearance(next);
    document.documentElement.dataset.siteTheme = next;
    localStorage.setItem("chartkit-site-theme", next);
  }
  return <button aria-label={`Switch to ${appearance === "light" ? "dark" : "light"} mode`} className="theme-toggle" onClick={toggle} type="button">{appearance === "light" ? "◐" : "◑"}</button>;
}
