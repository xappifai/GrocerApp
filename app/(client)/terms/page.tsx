import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Terms of Service | ${APP_NAME}`,
  description: `${APP_NAME}'s Terms of Service — the rules and conditions that govern your use of our platform.`,
};

const LAST_UPDATED = "1 May 2025";

export default function TermsPage() {
  return (
    <div className="space-y-10 pb-12">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-gray-800 to-gray-950 px-8 py-14 text-white md:px-16">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-300">
            <FileText className="h-3.5 w-3.5" /> Legal
          </div>
          <h1 className="font-display text-5xl font-bold leading-tight">
            Terms of Service
          </h1>
          <p className="mt-4 text-gray-300">
            Last updated: <strong>{LAST_UPDATED}</strong>
          </p>
          <p className="mt-3 max-w-lg text-gray-400 leading-relaxed">
            Please read these terms carefully before using {APP_NAME}. By creating an
            account or placing an order, you agree to be bound by these terms.
          </p>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl space-y-10 rounded-3xl border border-gray-100 bg-white px-8 py-10 shadow-card md:px-12">

        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using {APP_NAME} (&quot;the Service&quot;), you agree to be legally
            bound by these Terms of Service and our{" "}
            <Link href="/privacy" className="text-brand-600 hover:underline">
              Privacy Policy
            </Link>
            . If you do not agree to these terms, please do not use the Service.
          </p>
          <p>
            We reserve the right to update these terms at any time. Continued use of the
            Service after changes are posted constitutes your acceptance of the updated terms.
          </p>
        </Section>

        <Section title="2. Eligibility">
          <p>
            You must be at least 18 years old to create an account and use the Service.
            By using {APP_NAME}, you represent and warrant that you are 18 or older and
            have the legal capacity to enter into a binding agreement.
          </p>
        </Section>

        <Section title="3. Accounts">
          <p>
            To place orders, you must create an account. You are responsible for:
          </p>
          <ul>
            <li>Maintaining the confidentiality of your password.</li>
            <li>All activity that occurs under your account.</li>
            <li>Notifying us immediately of any unauthorised use.</li>
          </ul>
          <p>
            We reserve the right to suspend or terminate accounts that violate these
            terms or engage in fraudulent activity.
          </p>
        </Section>

        <Section title="4. Orders and Payment">
          <p>
            By placing an order, you are making an offer to purchase the selected products.
            We reserve the right to accept or decline any order at our discretion.
          </p>
          <p>
            All orders are fulfilled via <strong>cash on delivery</strong>. Payment is due
            at the time of delivery. Prices displayed on the platform are inclusive of
            applicable taxes unless stated otherwise.
          </p>
          <p>
            We strive to maintain accurate pricing. In the event of a pricing error, we
            will notify you before processing the order and give you the option to
            confirm at the correct price or cancel.
          </p>
        </Section>

        <Section title="5. Delivery">
          <p>
            Delivery is available to addresses within our service area. Estimated delivery
            times are provided at checkout and are not guaranteed. We are not liable for
            delays caused by factors outside our control (traffic, weather, etc.).
          </p>
          <p>
            You are responsible for providing an accurate delivery address. We are not
            liable for failed deliveries due to incorrect addresses.
          </p>
        </Section>

        <Section title="6. Product Quality & Returns">
          <p>
            We guarantee the freshness of all products at the time of dispatch. If you
            receive a damaged, incorrect, or spoiled item, please contact us within
            <strong> 2 hours of delivery</strong> with your order number and a photo.
          </p>
          <p>
            Refunds or replacements are provided at our discretion based on the nature of
            the issue. Perishable items cannot be returned; we will issue a store credit
            or refund for qualifying complaints.
          </p>
        </Section>

        <Section title="7. Cancellations">
          <p>
            You may cancel an order within <strong>15 minutes</strong> of placing it,
            provided it has not yet entered the processing stage. To cancel, visit your
            Orders page or contact support immediately.
          </p>
          <p>
            We reserve the right to cancel orders due to stock unavailability, delivery
            constraints, or suspected fraudulent activity. We will notify you promptly
            if this occurs.
          </p>
        </Section>

        <Section title="8. Prohibited Conduct">
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose.</li>
            <li>Place fraudulent or fake orders.</li>
            <li>Attempt to gain unauthorised access to any part of the Service.</li>
            <li>Scrape, crawl, or copy content from the platform without permission.</li>
            <li>Impersonate any person or entity.</li>
            <li>Interfere with or disrupt the integrity of the Service.</li>
          </ul>
        </Section>

        <Section title="9. Intellectual Property">
          <p>
            All content on {APP_NAME} — including text, graphics, logos, icons, and
            software — is the property of {APP_NAME} or its content suppliers and is
            protected by applicable intellectual property laws.
          </p>
          <p>
            You may not reproduce, distribute, or create derivative works from any content
            on this platform without our express written permission.
          </p>
        </Section>

        <Section title="10. Disclaimer of Warranties">
          <p>
            The Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis without
            warranties of any kind, express or implied. We do not warrant that the Service
            will be uninterrupted, error-free, or free of harmful components.
          </p>
        </Section>

        <Section title="11. Limitation of Liability">
          <p>
            To the fullest extent permitted by law, {APP_NAME} shall not be liable for
            any indirect, incidental, special, consequential, or punitive damages arising
            from your use of the Service, including loss of data, revenue, or profits.
          </p>
          <p>
            Our total liability for any claim arising from these terms or your use of the
            Service shall not exceed the total amount paid by you in the 30 days preceding
            the claim.
          </p>
        </Section>

        <Section title="12. Governing Law">
          <p>
            These terms are governed by and construed in accordance with applicable law.
            Any disputes shall be resolved in the courts of competent jurisdiction.
          </p>
        </Section>

        <Section title="13. Contact">
          <p>
            If you have questions about these Terms of Service, please contact us:
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
          href="/privacy"
          className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600 transition-colors shadow-sm"
        >
          Privacy Policy →
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
