"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Leaf } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";
import { APP_NAME } from "@/lib/constants";

export default function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Enter a valid email";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await login({ email, password });
      const user = useAuthStore.getState().user;
      toast.success(`Welcome back, ${user?.name?.split(" ")[0]}!`);
      router.push(user?.role === "ADMIN" ? "/admin" : "/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden w-1/2 flex-col justify-between bg-brand-700 p-12 lg:flex">
        <Link href="/" className="flex items-center gap-2 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold">{APP_NAME}</span>
        </Link>

        <div>
          <h1 className="font-display text-4xl font-bold leading-tight text-white">
            Fresh groceries,
            <br />
            delivered fast.
          </h1>
          <p className="mt-4 text-brand-200">
            From farm to your doorstep. Shop from hundreds of fresh products.
          </p>
        </div>

        <div className="flex gap-4 text-4xl">
          <span>🥦</span><span>🍓</span><span>🥛</span><span>🥩</span><span>🍞</span>
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
            <h2 className="font-display text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-500">Sign in to your account to continue</p>
          </div>

          <div className="mb-6 rounded-xl bg-amber-50 border border-amber-100 p-4">
            <p className="text-xs font-semibold text-amber-700 mb-1">Demo Credentials</p>
            <p className="text-xs text-amber-600">Admin: admin@grocerapp.com / admin123</p>
            <p className="text-xs text-amber-600">Client: ahmed@example.com / client123</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="current-password"
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            <Button type="submit" isLoading={isLoading} fullWidth size="lg" className="mt-2">
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-brand-600 hover:text-brand-700">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
