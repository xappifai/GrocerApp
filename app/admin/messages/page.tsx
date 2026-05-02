import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import MessagesContent from "./MessagesContent";
import type { ContactMessage } from "@/services/contactService";

export const metadata: Metadata = {
  title: "Messages | Admin",
};

export default async function AdminMessagesPage() {
  const supabase = createClient();

  // Server-side admin guard
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "ADMIN") redirect("/");

  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);

  const messages = (data ?? []) as ContactMessage[];

  return <MessagesContent initialMessages={messages} />;
}
