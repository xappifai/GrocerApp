"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AdminError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <div>
        <h2 className="font-display text-xl font-bold text-gray-900">
          Admin page error
        </h2>
        <p className="mt-1 text-sm text-gray-500 max-w-xs">
          An error occurred while loading this admin page. Check the console for details.
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre className="mt-3 max-w-sm rounded-lg bg-red-50 p-3 text-left text-xs text-red-700 overflow-auto">
            {error.message}
          </pre>
        )}
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
