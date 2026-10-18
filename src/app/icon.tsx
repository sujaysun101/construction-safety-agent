import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#1C3A2E",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#E4F25A",
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        H
      </div>
    ),
    { ...size },
  );
}
