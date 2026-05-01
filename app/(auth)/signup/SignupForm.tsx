"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Leaf, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";
import { APP_NAME } from "@/lib/constants";

export default function SignupForm() {
  const router = useRouter();
  const { signup, isLoading } = useAuthStore();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await signup({ name: form.name, email: form.email, password: form.password });
      toast.success("Account created! Welcome 🎉");
      router.push("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Signup failed");
    }
  };

  const strengthChecks = [
    { label: "At least 6 characters", met: form.password.length >= 6 },
    { label: "Contains a number", met: /\d/.test(form.password) },
    { label: "Passwords match", met: form.password === form.confirm && form.confirm.length > 0 },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden w-1/2 flex-col justify-between bg-brand-800 p-12 lg:flex">
        <Link href="/" className="flex items-center gap-2 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold">{APP_NAME}</span>
        </Link>

        <div>
          <h1 className="font-display text-4xl font-bold leading-tight text-white">
            Join thousands of
            <br />
            happy customers.
          </h1>
          <p className="mt-4 text-brand-200">
            Sign up today and get fresh groceries delivered to your door.
          </p>
          <div className="mt-8 space-y-2">
            {["Free delivery on first order", "Wide selection of fresh produce", "Real-time order tracking"].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-brand-100">
                <CheckCircle2 className="h-4 w-4 text-brand-300" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 text-4xl">
          <span>🥕</span><span>🫐</span><span>🧀</span><span>🍗</span><span>🧃</span>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Leaf className="h-4 w-4" />
            </div>
            <span className="font-display text-xl font-bold text-gray-900">{APP_NAME}</span>
          </Link>

          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-gray-900">Create account</h2>
            <p className="mt-2 text-sm text-gray-500">Fill in the details below to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Ahmed Khan"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              error={errors.name}
              autoComplete="name"
              required
            />

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              error={errors.email}
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              error={errors.password}
              autoComplete="new-password"
              required
              rightElement={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat password"
              value={form.confirm}
              onChange={(e) => set("confirm", e.target.value)}
              error={errors.confirm}
              autoComplete="new-password"
              required
            />

            {form.password && (
              <div className="space-y-1.5 rounded-xl bg-gray-50 p-3">
                {strengthChecks.map((check) => (
                  <div key={check.label} className="flex items-center gap-2">
                    <div
                      className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                        check.met ? "bg-brand-500" : "bg-gray-300"
                      }`}
                    />
                    <span className={`text-xs ${check.met ? "text-brand-600" : "text-gray-400"}`}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <Button type="submit" isLoading={isLoading} fullWidth size="lg" className="mt-2">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
