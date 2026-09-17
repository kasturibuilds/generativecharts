"use client";

import { useEffect, useState } from "react";

export function DocsToc({ sections }: { sections: string[] }) {
  const [activeSection, setActiveSection] = useState(sections[0]);

  useEffect(() => {
    const elements = sections.map((id) => document.getElementById(id));
    let frame = 0;

    function updateActiveSection() {
      frame = 0;
      // Follow the section occupying the upper reading area, including tall sections.
      const readingLine = Math.max(100, window.innerHeight * 0.3);
      let active = sections[0];
      for (const element of elements) {
        if (element && element.getBoundingClientRect().top <= readingLine) active = element.id;
      }
      // The final section may be too short to reach the reading line.
      if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        active = sections[sections.length - 1];
      }
      setActiveSection(active);
    }

    function scheduleUpdate() {
      if (!frame) frame = window.requestAnimationFrame(updateActiveSection);
    }

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", scheduleUpdate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", scheduleUpdate);
    };
  }, [sections]);

  return <nav className="docs-toc" aria-label="Documentation sections">
    {sections.map((section, index) => <a
      href={`#${section}`}
      key={section}
      aria-current={activeSection === section ? "location" : undefined}
    >{String(index + 1).padStart(2, "0")} · {section[0].toUpperCase() + section.slice(1)}</a>)}
  </nav>;
}
