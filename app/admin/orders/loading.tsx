export default function AdminOrdersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-24 rounded bg-gray-200" />
          <div className="h-4 w-48 rounded bg-gray-100" />
        </div>
        <div className="h-9 w-20 rounded-xl bg-gray-100" />
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-gray-100" />
        ))}
      </div>
      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="h-12 border-b border-gray-100 bg-gray-50" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50">
            <div className="h-4 w-16 rounded bg-gray-200" />
            <div className="h-4 w-32 rounded bg-gray-100 flex-1" />
            <div className="h-6 w-20 rounded-full bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
