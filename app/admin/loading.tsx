export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Page title */}
      <div className="space-y-2">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="h-4 w-64 rounded bg-gray-100" />
      </div>
      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-gray-100" />
        ))}
      </div>
      {/* Table placeholder */}
      <div className="h-72 rounded-2xl bg-gray-100" />
    </div>
  );
}
