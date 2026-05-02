import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  // Resolves relative OG / Twitter image URLs in generateMetadata() across all routes.
  // Falls back to localhost in development; set NEXT_PUBLIC_APP_URL in production.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: APP_DESCRIPTION,
  // PWA meta
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: { telephone: false },
  themeColor: "#16a34a",
  manifest: "/manifest.webmanifest",
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${plusJakarta.variable}`}>
      <body className="font-body antialiased bg-[#f8faf8] text-gray-900">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "12px",
              fontSize: "14px",
              fontFamily: "var(--font-plus-jakarta)",
            },
            success: {
              iconTheme: { primary: "#15803d", secondary: "#fff" },
            },
          }}
        />
      </body>
    </html>
  );
}
