"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production swap this for a proper error service (Sentry, etc.)
    console.error("[RootError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#f8faf8] px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50">
        <AlertTriangle className="h-10 w-10 text-red-500" />
      </div>

      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 md:text-3xl">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
          An unexpected error occurred. Our team has been notified. Please try
          again or come back later.
        </p>

        {/* Show error details in development only */}
        {process.env.NODE_ENV === "development" && (
          <pre className="mt-4 max-w-md rounded-xl bg-red-50 p-4 text-left text-xs text-red-700 overflow-auto border border-red-100">
            {error.message}
            {error.digest && `\n\nDigest: ${error.digest}`}
          </pre>
        )}
      </div>

      <div className="flex gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  );
}
