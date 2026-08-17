import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Same otter mark as OtterLogo/icon.svg, redrawn with plain divs since iOS
// reads this as a static image (no CSS vars / theme to react to), so the
// colors are hardcoded to the dark-navy gradient the logo always uses.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #00008b, #2626c9)",
          borderRadius: 50,
        }}
      >
        <div style={{ position: "relative", width: "100%", height: "100%", display: "flex" }}>
          <div
            style={{
              position: "absolute",
              left: 62,
              top: 44,
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "white",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 92,
              top: 44,
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "white",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 52,
              top: 53,
              width: 77,
              height: 77,
              borderRadius: "50%",
              background: "white",
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 67,
              top: 85,
              width: 46,
              height: 35,
              borderRadius: "50%",
              background: "#00008b",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 70,
              top: 76,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#00008b",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 100,
              top: 76,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#00008b",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 84,
              top: 99,
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "8px solid #00008b",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
