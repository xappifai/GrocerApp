import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GrocerApp — Fresh Groceries",
    short_name: "GrocerApp",
    description: "Fresh groceries delivered fast to your door.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f0fdf4",
    theme_color: "#16a34a",
    categories: ["shopping", "food"],
    icons: [
      // Raster icons — required for iOS Safari PWA install + Android launcher
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      // SVG vector icons — used by Chrome/Edge on desktop & modern Android
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Shop",
        short_name: "Shop",
        url: "/",
        description: "Browse fresh products",
      },
      {
        name: "My Orders",
        short_name: "Orders",
        url: "/orders",
        description: "View your orders",
      },
      {
        name: "My Profile",
        short_name: "Profile",
        url: "/profile",
        description: "Manage your profile",
      },
    ],
  };
}
