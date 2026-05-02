"use client";

import { useState, useRef } from "react";
import { Send, CheckCircle } from "lucide-react";
import { z } from "zod";
import { contactService } from "@/services/contactService";
import toast from "react-hot-toast";

const SUBJECTS = [
  "General Inquiry",
  "Order Issue",
  "Delivery Problem",
  "Product Quality",
  "Billing & Payment",
  "Account Help",
  "Feedback / Suggestion",
  "Other",
];

const NAME_MAX    = 100;
const EMAIL_MAX   = 254;  // RFC 5321 limit
const MESSAGE_MAX = 1000;

const contactSchema = z.object({
  name:    z.string().min(1, "Name is required").max(NAME_MAX, `Name must be ${NAME_MAX} characters or fewer`),
  email:   z.string().email("Enter a valid email address").max(EMAIL_MAX),
  subject: z.string(),
  message: z.string().min(1, "Message is required").max(MESSAGE_MAX, `Message must be ${MESSAGE_MAX} characters or fewer`),
});

const RATE_LIMIT_MS = 60_000; // 1 submission per 60 seconds per browser session

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: SUBJECTS[0],
    message: "",
    // honeypot — must stay empty; bots fill it automatically
    website: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const lastSubmitAt = useRef<number>(0);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check — real users never fill the hidden "website" field
    if (form.website) return;

    // Client-side rate limit
    const now = Date.now();
    if (now - lastSubmitAt.current < RATE_LIMIT_MS) {
      const remaining = Math.ceil((RATE_LIMIT_MS - (now - lastSubmitAt.current)) / 1000);
      toast.error(`Please wait ${remaining}s before sending another message.`);
      return;
    }

    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const firstError = result.error.errors[0]?.message ?? "Please fill in all required fields.";
      toast.error(firstError);
      return;
    }

    setIsSubmitting(true);
    try {
      await contactService.send(result.data);
      lastSubmitAt.current = Date.now();
      setSubmitted(true);
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-brand-100 bg-brand-50 px-8 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
          <CheckCircle className="h-8 w-8 text-brand-600" />
        </div>
        <h3 className="font-display text-2xl font-bold text-gray-900">
          Message sent!
        </h3>
        <p className="max-w-sm text-gray-500">
          Thanks for reaching out, <strong>{form.name}</strong>. We&apos;ll get back to
          you at <strong>{form.email}</strong> within 24 hours.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setForm({ name: "", email: "", subject: SUBJECTS[0], message: "", website: "" });
          }}
          className="mt-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Honeypot — invisible to real users; bots autofill it and get silently blocked */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={handleChange}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Name */}
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
            Your name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={NAME_MAX}
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
            Email address <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={EMAIL_MAX}
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-gray-700">
          Subject
        </label>
        <select
          id="subject"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        >
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-gray-700">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          maxLength={MESSAGE_MAX}
          value={form.message}
          onChange={handleChange}
          placeholder="Tell us how we can help…"
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <p className={`mt-1 text-right text-xs ${form.message.length >= MESSAGE_MAX ? "text-red-500 font-medium" : "text-gray-400"}`}>
          {form.message.length} / {MESSAGE_MAX}
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 transition-colors"
      >
        {isSubmitting ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Sending…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" /> Send Message
          </>
        )}
      </button>
    </form>
  );
}
