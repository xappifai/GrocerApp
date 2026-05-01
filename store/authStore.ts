import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { User, LoginCredentials, SignupCredentials } from "@/types";

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  login:      (credentials: LoginCredentials) => Promise<void>;
  signup:     (credentials: SignupCredentials) => Promise<void>;
  logout:     () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user:            null,
  isLoading:       false,
  isAuthenticated: false,
  isInitialized:   false,

  initialize: async () => {
    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (authUser) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, role")
        .eq("id", authUser.id)
        .single();

      set({
        user: {
          id:        authUser.id,
          name:      profile?.name || authUser.user_metadata?.name || "",
          email:     authUser.email!,
          role:      (profile?.role as User["role"]) || "CLIENT",
          createdAt: authUser.created_at,
        },
        isAuthenticated: true,
        isInitialized:   true,
      });
    } else {
      set({ isInitialized: true });
    }

    // Keep the store in sync with Supabase auth state (tab switches, token expiry, etc.)
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, role")
          .eq("id", session.user.id)
          .single();

        set({
          user: {
            id:        session.user.id,
            name:      profile?.name || session.user.user_metadata?.name || "",
            email:     session.user.email!,
            role:      (profile?.role as User["role"]) || "CLIENT",
            createdAt: session.user.created_at,
          },
          isAuthenticated: true,
          isInitialized:   true,
        });
      } else if (event === "SIGNED_OUT") {
        set({ user: null, isAuthenticated: false, isInitialized: true });
      }
    });
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email:    credentials.email,
        password: credentials.password,
      });
      if (error) throw new Error(error.message);

      const { data: profile } = await supabase
        .from("profiles")
        .select("name, role")
        .eq("id", data.user.id)
        .single();

      set({
        user: {
          id:        data.user.id,
          name:      profile?.name || data.user.user_metadata?.name || "",
          email:     data.user.email!,
          role:      (profile?.role as User["role"]) || "CLIENT",
          createdAt: data.user.created_at,
        },
        isAuthenticated: true,
        isLoading:       false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  signup: async (credentials) => {
    set({ isLoading: true });
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email:    credentials.email,
        password: credentials.password,
        options:  { data: { name: credentials.name } },
      });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error("Signup failed — please try again.");

      set({
        user: {
          id:        data.user.id,
          name:      credentials.name,
          email:     credentials.email,
          role:      "CLIENT",
          createdAt: data.user.created_at,
        },
        isAuthenticated: true,
        isLoading:       false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },
}));
