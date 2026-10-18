import { ImageResponse } from "next/og";

export const alt = "HiVis — daily safety walks for small construction crews";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#1C3A2E",
          color: "#F7F4EC",
          padding: 64,
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#E4F25A", fontWeight: 700 }}>HiVis</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 0.95, letterSpacing: -1 }}>Walk the site. Leave with the list.</div>
          <div style={{ marginTop: 24, fontSize: 28, color: "#D5DDD4" }}>Daily safety walks from the photos a small crew already takes.</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
