"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import ClientNavbar from "@/components/client/ClientNavbar";
import BottomTabBar from "@/components/client/BottomTabBar";
import Footer from "@/components/client/Footer";
import { useAuthStore } from "@/store/authStore";

const CartDrawer = dynamic(() => import("@/components/client/CartDrawer"), { ssr: false });

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { initialize, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) initialize();
  }, [initialize, isInitialized]);

  return (
    <div className="flex min-h-screen flex-col bg-[#f8faf8]">
      <ClientNavbar />

      {/*
        pb-24 on mobile = clear the fixed bottom tab bar (56 px bar + 16 px gap).
        On md+ the bottom bar is hidden so we restore normal vertical padding.
      */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 sm:px-6 md:pb-8 lg:px-8 xl:py-10">
        {children}
      </main>

      {/* Footer — desktop only; on mobile the bottom tab bar replaces it */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Fixed bottom tab bar — mobile only */}
      <BottomTabBar />

      <CartDrawer />
    </div>
  );
}
