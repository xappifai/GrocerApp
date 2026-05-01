import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";
import CartContent from "./CartContent";

export const metadata: Metadata = {
  title: `Shopping Cart | ${APP_NAME}`,
  description: "Review your selected items and proceed to checkout.",
  robots: { index: false },
};

export default function CartPage() {
  return <CartContent />;
}
