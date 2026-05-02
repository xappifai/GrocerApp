import { ImageResponse } from "next/og";
import { APP_NAME } from "@/lib/constants";

export const runtime     = "edge";
export const alt         = `${APP_NAME} — Fresh Groceries`;
export const contentType = "image/png";
export const size        = { width: 1200, height: 630 };

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #15803d 0%, #166534 100%)",
          width:       "100%",
          height:      "100%",
          display:     "flex",
          flexDirection: "column",
          alignItems:  "center",
          justifyContent: "center",
          gap:         24,
          fontFamily:  "Georgia, serif",
        }}
      >
        {/* Badge */}
        <div
          style={{
            background:   "rgba(255,255,255,0.15)",
            borderRadius: 100,
            padding:      "8px 24px",
            color:        "#bbf7d0",
            fontSize:     22,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          🌿 Fresh &amp; Organic
        </div>

        {/* App name */}
        <div
          style={{
            fontSize:   96,
            fontWeight: "bold",
            color:      "white",
          }}
        >
          {APP_NAME}
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 40,
            color:    "#86efac",
          }}
        >
          Fresh groceries, delivered fast.
        </div>

        {/* Pills */}
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          {["🚚 Free Delivery", "⚡ Fast Checkout", "🌿 100% Fresh"].map((text) => (
            <div
              key={text}
              style={{
                background:   "rgba(255,255,255,0.12)",
                borderRadius: 12,
                padding:      "10px 20px",
                color:        "white",
                fontSize:     26,
              }}
            >
              {text}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
