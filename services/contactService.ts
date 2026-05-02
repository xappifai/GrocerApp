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

// These limits are also enforced in the form UI and Zod schema.
// Keeping them here as a final server-side guard.
const LIMITS = { name: 100, email: 254, subject: 100, message: 1000 } as const;

export const contactService = {
  /** Send a message (public — no auth required) */
  async send(data: ContactInput): Promise<void> {
    // Truncate at the service layer in case Zod validation was bypassed
    const safe: ContactInput = {
      name:    data.name.slice(0, LIMITS.name).trim(),
      email:   data.email.slice(0, LIMITS.email).trim(),
      subject: data.subject.slice(0, LIMITS.subject).trim(),
      message: data.message.slice(0, LIMITS.message).trim(),
    };

    if (!safe.name || !safe.email || !safe.message) {
      throw new Error("Name, email and message are required.");
    }

    const supabase = createClient();
    const { error } = await supabase.from("contact_messages").insert(safe);
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
