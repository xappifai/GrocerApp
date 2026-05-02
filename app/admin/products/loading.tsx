export default function AdminProductsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-28 rounded bg-gray-200" />
          <div className="h-4 w-32 rounded bg-gray-100" />
        </div>
        <div className="h-9 w-32 rounded-xl bg-brand-100" />
      </div>
      {/* Search */}
      <div className="h-10 rounded-xl bg-gray-100" />
      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-card">
        <div className="h-12 border-b border-gray-100 bg-gray-50" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50">
            <div className="h-10 w-10 rounded-lg bg-gray-100 flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-40 rounded bg-gray-200" />
              <div className="h-3 w-56 rounded bg-gray-100" />
            </div>
            <div className="h-4 w-16 rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
