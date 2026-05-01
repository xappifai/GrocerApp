import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import MessagesContent from "./MessagesContent";
import type { ContactMessage } from "@/services/contactService";

export const metadata: Metadata = {
  title: "Messages | Admin",
};

export default async function AdminMessagesPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  const messages = (data ?? []) as ContactMessage[];

  return <MessagesContent initialMessages={messages} />;
}
