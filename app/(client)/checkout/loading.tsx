export default function CheckoutLoading() {
  return (
    <div className="max-w-5xl mx-auto animate-pulse">
      <div className="mb-6 h-9 w-36 rounded bg-gray-200" />
      <div className="grid gap-8 lg:grid-cols-5">
        {/* Delivery form skeleton */}
        <div className="lg:col-span-3 space-y-5">
          <div className="rounded-2xl bg-white p-6 shadow-card space-y-4">
            <div className="h-6 w-40 rounded bg-gray-200" />
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-4 w-20 rounded bg-gray-200" />
                  <div className="h-10 rounded-xl bg-gray-100" />
                </div>
              ))}
            </div>
          </div>
          <div className="h-12 rounded-2xl bg-brand-100" />
        </div>
        {/* Order summary skeleton */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white p-5 shadow-card space-y-4">
            <div className="h-6 w-32 rounded bg-gray-200" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gray-100" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-3 w-1/2 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
