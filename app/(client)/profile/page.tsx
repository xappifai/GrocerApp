import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { APP_NAME } from "@/lib/constants";
import ProfileForm from "./ProfileForm";

export const metadata: Metadata = {
  title: `My Profile | ${APP_NAME}`,
  description: "Manage your personal details and default delivery address.",
  robots: { index: false },
};

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, phone, address, city, latitude, longitude")
    .eq("id", user.id)
    .single();

  const initialProfile = {
    name:      profile?.name      || (user.user_metadata?.name as string) || "",
    phone:     profile?.phone     || "",
    address:   profile?.address   || "",
    city:      profile?.city      || "",
    latitude:  profile?.latitude  != null ? Number(profile.latitude)  : null,
    longitude: profile?.longitude != null ? Number(profile.longitude) : null,
  };

  return (
    <div className="max-w-2xl mx-auto">
      <ProfileForm initialProfile={initialProfile} />
    </div>
  );
}
