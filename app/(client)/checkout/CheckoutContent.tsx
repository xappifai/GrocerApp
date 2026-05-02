"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CheckCircle2, ArrowLeft, Lock,
  Navigation, ExternalLink, X, Loader2,
} from "lucide-react";
import { useCartStore }   from "@/store/cartStore";
import { useAuthStore }   from "@/store/authStore";
import { orderService }   from "@/services/orderService";
import Input              from "@/components/ui/Input";
import Button             from "@/components/ui/Button";
import { formatCurrency, imageUrl } from "@/lib/utils";
import toast from "react-hot-toast";

const schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone:    z.string().min(10, "Enter a valid phone number"),
  address:  z.string().min(5, "Address is required"),
  city:     z.string().min(2, "City is required"),
});

type FormData = z.infer<typeof schema>;

interface SavedProfile {
  name:      string;
  phone:     string;
  address:   string;
  city:      string;
  latitude:  number | null;
  longitude: number | null;
}

interface Props {
  savedProfile?: SavedProfile | null;
}

export default function CheckoutContent({ savedProfile }: Props) {
  const router = useRouter();
  const { items, totalPrice, clearCart }  = useCartStore();
  const { user, isAuthenticated }         = useAuthStore();
  const [isPlacing, setIsPlacing]         = useState(false);
  const [isLocating, setIsLocating]       = useState(false);
  // Idempotency guard — one successful submission per form mount.
  // Generated once; ensures a timed-out request that did succeed can't
  // create a second order if the user retries.
  const idempotencyKey = useRef(crypto.randomUUID());
  const [latitude,  setLatitude]          = useState<number | null>(
    savedProfile?.latitude  ?? null
  );
  const [longitude, setLongitude]         = useState<number | null>(
    savedProfile?.longitude ?? null
  );

  const price = totalPrice();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: savedProfile?.name    || user?.name || "",
      phone:    savedProfile?.phone   || "",
      address:  savedProfile?.address || "",
      city:     savedProfile?.city    || "Islamabad",
    },
  });

  if (items.length === 0) {
    router.replace("/cart");
    return null;
  }

  if (!isAuthenticated) {
    router.replace("/login");
    return null;
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setIsLocating(false);
        toast.success("Location pinned!");
      },
      () => {
        toast.error("Unable to get location — check browser permissions.");
        setIsLocating(false);
      },
      { timeout: 10000 }
    );
  };

  const onSubmit = async (data: FormData) => {
    // Double-submission guard: prevent a second request while one is in-flight
    if (isPlacing) return;
    setIsPlacing(true);
    try {
      await orderService.create({
        idempotencyKey:    idempotencyKey.current,
        items:             items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        deliveryAddress:   data.address,
        deliveryCity:      data.city,
        deliveryPhone:     data.phone,
        deliveryLatitude:  latitude,
        deliveryLongitude: longitude,
      });
      clearCart();
      toast.success("Order placed successfully! 🎉");
      // Keep isPlacing=true so the button stays disabled while we navigate away.
      // The component unmounts, so there's no memory-leak concern.
      router.push("/orders");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to place order. Please try again.");
      // Rotate the key so a legitimate retry won't be blocked
      idempotencyKey.current = crypto.randomUUID();
      setIsPlacing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/cart" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-3xl font-bold text-gray-900">Checkout</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* ── Delivery Form ─────────────────────────────────── */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Saved-profile hint */}
            {savedProfile?.name && (
              <div className="flex items-center gap-2 rounded-xl border border-brand-100 bg-brand-50 px-4 py-2.5 text-xs text-brand-700">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <span>
                  Pre-filled from your{" "}
                  <Link href="/profile" className="font-semibold underline underline-offset-2 hover:text-brand-800">
                    saved profile
                  </Link>
                  . You can edit anything below.
                </span>
              </div>
            )}

            <div className="rounded-2xl bg-white p-6 shadow-card">
              <h2 className="font-display text-lg font-bold text-gray-900 mb-4">
                Delivery Details
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    label="Full Name"
                    placeholder="Ahmed Khan"
                    error={errors.fullName?.message}
                    required
                    {...register("fullName")}
                  />
                </div>
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+92-300-0000000"
                  error={errors.phone?.message}
                  required
                  {...register("phone")}
                />
                <Input
                  label="City"
                  placeholder="Islamabad"
                  error={errors.city?.message}
                  required
                  {...register("city")}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Delivery Address"
                    placeholder="House No., Street, Area"
                    error={errors.address?.message}
                    required
                    {...register("address")}
                  />
                </div>
              </div>

              {/* ── Location Pin ──────────────────────────────── */}
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Location Pin{" "}
                  <span className="normal-case font-normal text-gray-400">
                    — optional, helps rider find you
                  </span>
                </p>

                {latitude != null && longitude != null ? (
                  <div className="flex items-center justify-between rounded-xl border border-brand-100 bg-brand-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-brand-800">📍 Location pinned</p>
                      <p className="mt-0.5 font-mono text-xs text-brand-600">
                        {latitude.toFixed(5)}, {longitude.toFixed(5)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`https://maps.google.com/?q=${latitude},${longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-lg border border-brand-200 bg-white px-2.5 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View
                      </a>
                      <button
                        type="button"
                        onClick={() => { setLatitude(null); setLongitude(null); }}
                        className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        <X className="h-3 w-3" />
                        Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-3 text-sm font-medium text-gray-500 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 transition-all disabled:opacity-50"
                  >
                    {isLocating ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Getting location…</>
                    ) : (
                      <><Navigation className="h-4 w-4" /> Pin my location</>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Lock className="h-4 w-4 text-brand-600" />
                <span>
                  <strong>Cash on Delivery</strong> — Pay when your order arrives.
                </span>
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isPlacing}
              fullWidth
              size="lg"
              leftIcon={<CheckCircle2 className="h-5 w-5" />}
            >
              {isPlacing ? "Placing Order…" : `Place Order · ${formatCurrency(price)}`}
            </Button>
          </form>
        </div>

        {/* ── Order Summary ─────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white p-5 shadow-card">
            <h2 className="font-display text-lg font-bold text-gray-900 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={imageUrl(item.product.image)}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatCurrency(item.product.price)} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{formatCurrency(price)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery</span>
                <span className="text-brand-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-100">
                <span>Total</span>
                <span className="font-display text-lg">{formatCurrency(price)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
