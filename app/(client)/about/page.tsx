import type { Metadata } from "next";
import Link from "next/link";
import {
  Leaf, Truck, ShieldCheck, Clock, Heart,
  Users, Package, Star, ArrowRight, Sprout,
} from "lucide-react";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

export const metadata: Metadata = {
  title: `About Us | ${APP_NAME}`,
  description: `Learn about ${APP_NAME} — our story, mission, and commitment to delivering fresh groceries to your door.`,
};

const VALUES = [
  {
    icon: Sprout,
    title: "Farm-Fresh Quality",
    desc: "We source directly from trusted farms and suppliers to ensure every product meets our strict freshness standards before it reaches your door.",
    color: "bg-brand-50 text-brand-600",
  },
  {
    icon: Truck,
    title: "Fast & Reliable Delivery",
    desc: "We know your time matters. Our delivery network is built for speed — your groceries arrive fresh, on time, every time.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Heart,
    title: "Community First",
    desc: "We believe in building a healthier community. From supporting local farmers to reducing food waste, we care about more than just groceries.",
    color: "bg-red-50 text-red-500",
  },
  {
    icon: ShieldCheck,
    title: "Transparency & Trust",
    desc: "No hidden charges, no surprises. Clear pricing, honest descriptions, and a straightforward cash-on-delivery model you can rely on.",
    color: "bg-amber-50 text-amber-600",
  },
];

const STATS = [
  { value: "500+",  label: "Products",         icon: Package },
  { value: "1,000+", label: "Happy Customers",  icon: Users   },
  { value: "4.8★",  label: "Average Rating",   icon: Star    },
  { value: "100%",  label: "Fresh Guarantee",  icon: ShieldCheck },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Browse & Pick",
    desc: "Explore hundreds of fresh products across categories. Search, filter by category, and find exactly what you need.",
  },
  {
    step: "02",
    title: "Add to Cart",
    desc: "Add items to your cart, adjust quantities on the fly, and review your order summary before checkout.",
  },
  {
    step: "03",
    title: "Checkout in Seconds",
    desc: "Fill in your delivery details — or use your saved profile — and place your order. Cash on delivery, no card needed.",
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-20 pb-12">

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 px-8 py-16 text-white md:px-16 md:py-20">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-200">
            <Leaf className="h-3.5 w-3.5" /> Our Story
          </div>
          <h1 className="font-display text-5xl font-bold leading-tight md:text-6xl">
            Fresh groceries,
            <br />
            <span className="text-brand-200">redefined.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-brand-100">
            {APP_NAME} was born from a simple frustration — getting fresh, quality
            groceries shouldn&apos;t be complicated or expensive. We set out to fix that.
          </p>
        </div>
      </div>

      {/* ── Our Story ─────────────────────────────────────────────────── */}
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Who We Are
          </span>
          <h2 className="mt-2 font-display text-4xl font-bold text-gray-900">
            More than just a grocery store
          </h2>
          <div className="mt-5 space-y-4 text-gray-600 leading-relaxed">
            <p>
              {APP_NAME} started as a small idea — what if getting groceries was as easy as
              tapping a button? Fresh produce, dairy, meat, and pantry staples delivered right
              to your door, without the hassle of traffic or long checkout queues.
            </p>
            <p>
              We partnered with local suppliers and farms to build a supply chain that
              prioritises freshness. Every product you see on our platform has been selected
              for quality first. If it doesn&apos;t meet our standards, it doesn&apos;t make it to
              your cart.
            </p>
            <p>
              Today, thousands of families rely on {APP_NAME} for their weekly groceries.
              We&apos;re proud of the trust they place in us — and we work every day to earn it.
            </p>
          </div>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            Start Shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Visual card grid */}
        <div className="grid grid-cols-2 gap-4">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-card"
            >
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
                <Icon className="h-5 w-5 text-brand-600" />
              </div>
              <p className="font-display text-3xl font-bold text-gray-900">{value}</p>
              <p className="mt-0.5 text-xs font-medium text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Values ────────────────────────────────────────────────────── */}
      <div>
        <div className="mb-10 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            What We Stand For
          </span>
          <h2 className="mt-2 font-display text-4xl font-bold text-gray-900">
            Our core values
          </h2>
          <p className="mt-3 text-gray-500">
            Everything we do is guided by these four principles.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card hover:shadow-card-hover transition-all"
            >
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── How It Works ─────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-gray-50 px-8 py-14 md:px-14">
        <div className="mb-10 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Simple & Fast
          </span>
          <h2 className="mt-2 font-display text-4xl font-bold text-gray-900">
            How it works
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {HOW_IT_WORKS.map(({ step, title, desc }) => (
            <div key={step} className="relative flex flex-col items-start">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-lg font-bold text-white font-display">
                {step}
              </div>
              <h3 className="font-display text-xl font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-gradient-to-r from-brand-600 to-brand-800 px-8 py-14 text-center text-white">
        <h2 className="font-display text-4xl font-bold">
          Ready to experience the difference?
        </h2>
        <p className="mt-3 text-brand-100">
          Join thousands of happy customers who trust {APP_NAME} for their weekly groceries.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="rounded-xl bg-white px-7 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50 transition-colors shadow-sm"
          >
            Shop Now
          </Link>
          <Link
            href="/contact"
            className="rounded-xl border border-white/30 bg-white/10 px-7 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>

    </div>
  );
}
