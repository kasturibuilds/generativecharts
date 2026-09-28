import Link from "next/link";

export function Brand() {
  return <Link aria-label="Generative Charts home" className="brand" href="/">
    <svg aria-hidden="true" className="brand-mark" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path className="brand-mark-line" pathLength="1" d="M6 23 12 14 21 18 27 9" fill="none" stroke="currentColor" strokeOpacity=".48" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <g fill="currentColor">
        <circle className="brand-mark-dot" cx="6" cy="23" r="2.25" />
        <circle className="brand-mark-dot" cx="12" cy="14" r="2.25" />
        <circle className="brand-mark-dot" cx="21" cy="18" r="2.25" />
        <circle className="brand-mark-dot" cx="27" cy="9" r="2.25" />
      </g>
    </svg>
    <span>Generative Charts</span>
  </Link>;
}
