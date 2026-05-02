import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import { APP_NAME } from "@/lib/constants";

export const runtime     = "edge";
export const contentType = "image/png";
export const size        = { width: 1200, height: 630 };

const EMOJI: Record<string, string> = {
  dairy:                "🥛",
  "rice-atta-grains":   "🌾",
  "daal-pulses":        "🫘",
  "oils-ghee":          "🫙",
  "spices-masala":      "🌶️",
  "sauces-condiments":  "🧴",
  beverages:            "🧃",
  "household-cleaning": "🧹",
  laundry:              "🧺",
};

export default async function Image({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data } = await supabase
    .from("categories")
    .select("name, slug")
    .eq("slug", params.slug)
    .single();

  const name  = (data?.name as string)  ?? "Products";
  const slug  = (data?.slug as string)  ?? params.slug;
  const emoji = EMOJI[slug] ?? "🛒";

  return new ImageResponse(
    (
      <div
        style={{
          background:    "linear-gradient(135deg, #15803d 0%, #166534 100%)",
          width:         "100%",
          height:        "100%",
          display:       "flex",
          flexDirection: "column",
          alignItems:    "center",
          justifyContent:"center",
          gap:           20,
          fontFamily:    "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 120 }}>{emoji}</div>
        <div style={{ fontSize: 80, fontWeight: "bold", color: "white" }}>{name}</div>
        <div style={{ fontSize: 36, color: "#86efac" }}>
          Shop {name} at {APP_NAME}
        </div>
      </div>
    ),
    size
  );
}
