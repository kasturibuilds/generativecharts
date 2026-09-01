import Link from "next/link";

export function Brand() {
  return <Link aria-label="ChartKit home" className="brand" href="/">
    <svg aria-hidden="true" className="brand-mark" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
      <g className="brand-mark-dots">
        <circle className="brand-mark-dot brand-mark-dot-one" cx="5" cy="19" r="2.15" />
        <circle className="brand-mark-dot brand-mark-dot-two" cx="9.5" cy="13.5" r="2.15" />
        <circle className="brand-mark-dot brand-mark-dot-three" cx="14" cy="16.5" r="2.15" />
        <circle className="brand-mark-dot brand-mark-dot-four" cx="19" cy="8.5" r="2.15" />
        <circle className="brand-mark-dot brand-mark-dot-five" cx="23.25" cy="11.5" r="2.15" />
      </g>
    </svg>
    <span>ChartKit</span>
  </Link>;
}
