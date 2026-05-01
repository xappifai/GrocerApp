import type { Metadata } from "next";
import Link from "next/link";
import { Shield } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Privacy Policy | ${APP_NAME}`,
  description: `${APP_NAME}'s Privacy Policy — how we collect, use, and protect your personal information.`,
};

const LAST_UPDATED = "1 May 2025";

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-10 pb-12">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-gray-800 to-gray-950 px-8 py-14 text-white md:px-16">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-300">
            <Shield className="h-3.5 w-3.5" /> Legal
          </div>
          <h1 className="font-display text-5xl font-bold leading-tight">
            Privacy Policy
          </h1>
          <p className="mt-4 text-gray-300">
            Last updated: <strong>{LAST_UPDATED}</strong>
          </p>
          <p className="mt-3 max-w-lg text-gray-400 leading-relaxed">
            Your privacy matters to us. This policy explains what information we collect,
            how we use it, and the choices you have.
          </p>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl space-y-10 rounded-3xl border border-gray-100 bg-white px-8 py-10 shadow-card md:px-12">

        <Section title="1. Information We Collect">
          <p>We collect information you provide directly to us, such as:</p>
          <ul>
            <li><strong>Account information</strong> — your name, email address, and password when you register.</li>
            <li><strong>Profile information</strong> — optional phone number, delivery address, and saved location coordinates.</li>
            <li><strong>Order information</strong> — items purchased, delivery address, and order history.</li>
            <li><strong>Contact messages</strong> — any messages you send us through our Contact page.</li>
          </ul>
          <p>We also collect certain information automatically when you use our service:</p>
          <ul>
            <li>Browser type, operating system, and device type.</li>
            <li>Pages visited, time spent on pages, and links clicked.</li>
            <li>IP address and general geographic region.</li>
          </ul>
        </Section>

        <Section title="2. How We Use Your Information">
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process and fulfill your orders, including delivery.</li>
            <li>Maintain and improve our platform and services.</li>
            <li>Send you transactional communications (order confirmations, updates).</li>
            <li>Respond to your questions and support requests.</li>
            <li>Detect and prevent fraudulent activity.</li>
            <li>Comply with legal obligations.</li>
          </ul>
          <p>
            We do <strong>not</strong> sell, rent, or trade your personal information
            to third parties for marketing purposes.
          </p>
        </Section>

        <Section title="3. Location Information">
          <p>
            When you choose to pin your delivery location, we request access to your
            device&apos;s GPS coordinates via your browser. This is entirely optional — you
            can also type your address manually.
          </p>
          <p>
            Location coordinates are stored securely and used only to display your
            delivery location to our team for fulfillment purposes. We do not track
            your location in the background.
          </p>
        </Section>

        <Section title="4. Data Sharing">
          <p>We may share your information with:</p>
          <ul>
            <li>
              <strong>Service providers</strong> — third-party vendors who help us operate
              our platform (e.g., Supabase for database hosting, Vercel for web hosting).
              These providers are contractually bound to protect your data.
            </li>
            <li>
              <strong>Law enforcement</strong> — when required by law or to protect the
              rights, property, or safety of {APP_NAME}, our users, or the public.
            </li>
          </ul>
        </Section>

        <Section title="5. Data Retention">
          <p>
            We retain your personal information for as long as your account is active or
            as needed to provide services. You may request deletion of your account and
            associated data at any time by contacting us at{" "}
            <a href="mailto:support@grocerapp.com" className="text-brand-600 hover:underline">
              support@grocerapp.com
            </a>.
          </p>
          <p>
            We may retain certain information for a limited period to comply with legal
            obligations or resolve disputes.
          </p>
        </Section>

        <Section title="6. Security">
          <p>
            We take reasonable technical and organisational measures to protect your
            information against unauthorized access, alteration, disclosure, or destruction.
            Your password is stored as a salted hash and is never stored in plain text.
          </p>
          <p>
            No method of transmission over the internet is 100% secure. While we strive
            to use commercially acceptable means to protect your data, we cannot guarantee
            absolute security.
          </p>
        </Section>

        <Section title="7. Cookies">
          <p>
            We use essential session cookies to keep you logged in and maintain your
            shopping cart. We do not use third-party tracking or advertising cookies.
          </p>
        </Section>

        <Section title="8. Children's Privacy">
          <p>
            Our service is not directed to children under 13. We do not knowingly collect
            personal information from children under 13. If you believe we have
            inadvertently collected such information, please contact us to have it removed.
          </p>
        </Section>

        <Section title="9. Your Rights">
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you.</li>
            <li>Correct inaccurate or incomplete information.</li>
            <li>Request deletion of your personal information.</li>
            <li>Object to or restrict certain processing of your data.</li>
            <li>Data portability — receive your data in a machine-readable format.</li>
          </ul>
          <p>
            To exercise any of these rights, please contact us at{" "}
            <a href="mailto:support@grocerapp.com" className="text-brand-600 hover:underline">
              support@grocerapp.com
            </a>.
          </p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify you of
            significant changes by posting the new policy on this page with an updated
            &quot;Last updated&quot; date. Your continued use of the service after changes
            constitutes acceptance of the updated policy.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <ul>
            <li>
              Email:{" "}
              <a href="mailto:support@grocerapp.com" className="text-brand-600 hover:underline">
                support@grocerapp.com
              </a>
            </li>
            <li>
              Contact form:{" "}
              <Link href="/contact" className="text-brand-600 hover:underline">
                grocerapp.com/contact
              </Link>
            </li>
          </ul>
        </Section>

      </div>

      {/* ── Related links ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/terms"
          className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600 transition-colors shadow-sm"
        >
          Terms of Service →
        </Link>
        <Link
          href="/contact"
          className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600 transition-colors shadow-sm"
        >
          Contact Us →
        </Link>
      </div>

    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-xl font-bold text-gray-900">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-gray-600 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}
