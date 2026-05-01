import { createClient } from "@/lib/supabase/client";
import type { LoginCredentials, SignupCredentials, User } from "@/types";

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    if (error) throw new Error(error.message);

    // Fetch role from profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, role")
      .eq("id", data.user.id)
      .single();

    return {
      id: data.user.id,
      name: profile?.name || data.user.user_metadata?.name || "",
      email: data.user.email!,
      role: (profile?.role as User["role"]) || "CLIENT",
      createdAt: data.user.created_at,
    };
  },

  async signup(credentials: SignupCredentials): Promise<User> {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: { data: { name: credentials.name } },
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("Signup failed — please try again.");

    return {
      id: data.user.id,
      name: credentials.name,
      email: credentials.email,
      role: "CLIENT",
      createdAt: data.user.created_at,
    };
  },

  async logout(): Promise<void> {
    const supabase = createClient();
    await supabase.auth.signOut();
  },

  async getUser(): Promise<User | null> {
    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("name, role")
      .eq("id", authUser.id)
      .single();

    return {
      id: authUser.id,
      name: profile?.name || authUser.user_metadata?.name || "",
      email: authUser.email!,
      role: (profile?.role as User["role"]) || "CLIENT",
      createdAt: authUser.created_at,
    };
  },
};
