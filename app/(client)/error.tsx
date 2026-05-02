"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ClientError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console in development; swap for a proper error service in prod
    console.error("[ClientError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <div>
        <h2 className="font-display text-xl font-bold text-gray-900">
          Something went wrong
        </h2>
        <p className="mt-1 text-sm text-gray-500 max-w-xs">
          We could not load this page. Please try again or come back later.
        </p>
      </div>
      <button
        onClick={reset}
        className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}
