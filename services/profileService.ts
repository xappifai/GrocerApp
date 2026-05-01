import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types";

export const profileService = {
  async get(): Promise<UserProfile | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("profiles")
      .select("name, phone, address, city, latitude, longitude")
      .eq("id", user.id)
      .single();

    if (!data) return null;
    return {
      name:      data.name      || "",
      phone:     data.phone     || "",
      address:   data.address   || "",
      city:      data.city      || "",
      latitude:  data.latitude  != null ? Number(data.latitude)  : null,
      longitude: data.longitude != null ? Number(data.longitude) : null,
    };
  },

  async update(patch: Partial<UserProfile>): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const payload: Record<string, unknown> = {};
    if (patch.name      !== undefined) payload.name      = patch.name;
    if (patch.phone     !== undefined) payload.phone     = patch.phone;
    if (patch.address   !== undefined) payload.address   = patch.address;
    if (patch.city      !== undefined) payload.city      = patch.city;
    if (patch.latitude  !== undefined) payload.latitude  = patch.latitude;
    if (patch.longitude !== undefined) payload.longitude = patch.longitude;

    const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);
    if (error) throw new Error(error.message);
  },
};
