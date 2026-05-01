import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: `Contact Us | ${APP_NAME}`,
  description: `Get in touch with the ${APP_NAME} team. We're here to help with any questions about your order, delivery, or account.`,
};

const CONTACT_INFO = [
  {
    icon: Mail,
    label: "Email",
    value: "support@grocerapp.com",
    sub: "We reply within 24 hours",
    color: "bg-brand-50 text-brand-600",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (800) 123-4567",
    sub: "Mon – Sat, 9 am – 6 pm",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: MapPin,
    label: "Address",
    value: "123 Fresh St, Food City",
    sub: "Head office",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Mon – Sun, 8 am – 10 pm",
    sub: "Delivery hours",
    color: "bg-purple-50 text-purple-600",
  },
];

export default function ContactPage() {
  return (
    <div className="space-y-16 pb-12">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 px-8 py-16 text-white md:px-16 md:py-20">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-200">
            <Mail className="h-3.5 w-3.5" /> Get in Touch
          </div>
          <h1 className="font-display text-5xl font-bold leading-tight md:text-6xl">
            We&apos;d love to
            <br />
            <span className="text-brand-200">hear from you.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-brand-100">
            Have a question, a problem with your order, or just want to say hello?
            Our team is ready to help — usually within 24 hours.
          </p>
        </div>
      </div>

      {/* ── Info cards + Form ─────────────────────────────────────────────── */}
      <div className="grid gap-12 lg:grid-cols-5 lg:items-start">

        {/* Left: contact info */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-600">
              Contact Info
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold text-gray-900">
              Reach us directly
            </h2>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              You can also use the form on the right to send us a message and
              we&apos;ll get back to you as soon as possible.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {CONTACT_INFO.map(({ icon: Icon, label, value, sub, color }) => (
              <div
                key={label}
                className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-card"
              >
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {label}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-900">{value}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: form */}
        <div className="lg:col-span-3">
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-card">
            <h2 className="mb-1 font-display text-2xl font-bold text-gray-900">
              Send us a message
            </h2>
            <p className="mb-6 text-sm text-gray-500">
              Fill in the form below and we&apos;ll get back to you within 24 hours.
            </p>
            <ContactForm />
          </div>
        </div>
      </div>

      {/* ── FAQ strip ─────────────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-gray-50 px-8 py-12 md:px-14">
        <div className="mb-8 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            FAQ
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold text-gray-900">
            Common questions
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              q: "How long does delivery take?",
              a: "Most orders are delivered within 2–4 hours of being placed. Delivery times may vary based on your location and order volume.",
            },
            {
              q: "What payment methods do you accept?",
              a: "We currently accept cash on delivery only. No card or online payment is required — simply pay when your order arrives.",
            },
            {
              q: "Can I modify or cancel my order?",
              a: "You can cancel or modify your order within 15 minutes of placing it. After that, the order enters processing and cannot be changed.",
            },
            {
              q: "What if I receive a damaged or wrong item?",
              a: "We're sorry to hear that! Please contact us immediately with your order number and a photo of the item. We'll resolve it right away.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
              <h3 className="font-display text-base font-semibold text-gray-900">{q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{a}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
