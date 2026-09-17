import { ImageResponse } from "next/og";

export const alt = "Generative Charts — Charts with a point of view";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", background: "#f7f6f2", color: "#161616", padding: 64 }}>
      <svg width="112" height="112" viewBox="0 0 28 28" fill="#161616">
        <circle cx="5" cy="19" r="2.15" /><circle cx="9.5" cy="13.5" r="2.15" /><circle cx="14" cy="16.5" r="2.15" /><circle cx="19" cy="8.5" r="2.15" /><circle cx="23.25" cy="11.5" r="2.15" />
      </svg>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 94, fontWeight: 700, letterSpacing: -5 }}>Generative Charts</div>
        <div style={{ fontSize: 32, marginTop: 18 }}>Charts with a point of view.</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #b9b8b3", paddingTop: 24, fontSize: 22 }}>
        <span>18 chart families · 3 themes · React</span>
        <span>Generative Charts</span>
      </div>
    </div>,
    size,
  );
}
