export function ThemeIcon({ appearance }: { appearance: "light" | "dark" }) {
  return appearance === "dark"
    ? <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20.2 15.7A8.5 8.5 0 0 1 8.3 3.8 8.5 8.5 0 1 0 20.2 15.7Z" /></svg>
    : <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
}
