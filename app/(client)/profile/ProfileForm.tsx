"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft, User, Phone, MapPin, Navigation,
  CheckCircle2, Loader2, ExternalLink, X,
} from "lucide-react";
import { profileService } from "@/services/profileService";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

const schema = z.object({
  name:    z.string().min(2, "Name must be at least 2 characters"),
  phone:   z.string().min(0),
  address: z.string().min(0),
  city:    z.string().min(0),
});

type FormData = z.infer<typeof schema>;

interface Props {
  initialProfile: {
    name: string;
    phone: string;
    address: string;
    city: string;
    latitude: number | null;
    longitude: number | null;
  };
}

export default function ProfileForm({ initialProfile }: Props) {
  const router = useRouter();
  const [isSaving, setIsSaving]   = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [latitude, setLatitude]   = useState<number | null>(initialProfile.latitude);
  const [longitude, setLongitude] = useState<number | null>(initialProfile.longitude);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:    initialProfile.name,
      phone:   initialProfile.phone,
      address: initialProfile.address,
      city:    initialProfile.city,
    },
  });

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
        toast.success("Location captured!");
      },
      () => {
        toast.error("Unable to get your location — check browser permissions.");
        setIsLocating(false);
      },
      { timeout: 10000 }
    );
  };

  const onSubmit = async (data: FormData) => {
    setIsSaving(true);
    try {
      await profileService.update({
        name:      data.name,
        phone:     data.phone,
        address:   data.address,
        city:      data.city,
        latitude,
        longitude,
      });
      toast.success("Profile saved!");
      router.refresh();
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your details — they auto-fill at checkout
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* ── Personal Info ───────────────────────────────────── */}
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50">
              <User className="h-4 w-4 text-brand-600" />
            </div>
            <h2 className="font-display text-base font-semibold text-gray-900">
              Personal Info
            </h2>
          </div>
          <div className="grid gap-4">
            <Input
              label="Full Name"
              placeholder="Ahmed Khan"
              error={errors.name?.message}
              required
              {...register("name")}
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+92-300-0000000"
              error={errors.phone?.message}
              {...register("phone")}
            />
          </div>
        </div>

        {/* ── Default Delivery ────────────────────────────────── */}
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50">
              <MapPin className="h-4 w-4 text-brand-600" />
            </div>
            <h2 className="font-display text-base font-semibold text-gray-900">
              Default Delivery Address
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Delivery Address"
                placeholder="House No., Street, Area"
                {...register("address")}
              />
            </div>
            <Input
              label="City"
              placeholder="Islamabad"
              {...register("city")}
            />
          </div>
        </div>

        {/* ── Location Pin ────────────────────────────────────── */}
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50">
              <Navigation className="h-4 w-4 text-brand-600" />
            </div>
            <h2 className="font-display text-base font-semibold text-gray-900">
              Location Pin
            </h2>
            <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
              Optional
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Pin your exact location so the delivery rider can find you easily. Opens in Google Maps for the admin.
          </p>

          {latitude != null && longitude != null ? (
            <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-brand-800">
                    📍 Location pinned
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-brand-600">
                    {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </p>
                </div>
                <div className="flex flex-shrink-0 gap-2">
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
            </div>
          ) : (
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isLocating}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-5 text-sm font-medium text-gray-500 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 transition-all duration-150 disabled:opacity-50"
            >
              {isLocating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Getting your location…
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4" />
                  Use my current location
                </>
              )}
            </button>
          )}
        </div>

        <Button
          type="submit"
          isLoading={isSaving}
          fullWidth
          size="lg"
          leftIcon={<CheckCircle2 className="h-5 w-5" />}
        >
          {isSaving ? "Saving…" : "Save Profile"}
        </Button>
      </form>
    </div>
  );
}
