import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { APP_NAME } from "@/lib/constants";
import CheckoutContent from "./CheckoutContent";

export const metadata: Metadata = {
  title: `Checkout | ${APP_NAME}`,
  description: "Complete your order with secure checkout.",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let savedProfile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("name, phone, address, city, latitude, longitude")
      .eq("id", user.id)
      .single();

    if (data) {
      savedProfile = {
        name:      (data.name      as string)  || "",
        phone:     (data.phone     as string)  || "",
        address:   (data.address   as string)  || "",
        city:      (data.city      as string)  || "",
        latitude:  data.latitude  != null ? Number(data.latitude)  : null,
        longitude: data.longitude != null ? Number(data.longitude) : null,
      };
    }
  }

  return <CheckoutContent savedProfile={savedProfile} />;
}
