import { createClient } from "@/lib/supabase/client";

export interface ContactInput {
  name:    string;
  email:   string;
  subject: string;
  message: string;
}

export interface ContactMessage extends ContactInput {
  id:         string;
  created_at: string;
}

export const contactService = {
  /** Send a message (public — no auth required) */
  async send(data: ContactInput): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("contact_messages").insert({
      name:    data.name,
      email:   data.email,
      subject: data.subject,
      message: data.message,
    });
    if (error) throw new Error(error.message);
  },

  /** Fetch all messages — admin only */
  async getAll(): Promise<ContactMessage[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as ContactMessage[];
  },
};
