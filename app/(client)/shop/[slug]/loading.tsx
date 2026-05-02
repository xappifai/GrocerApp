export default function CategoryLoading() {
  return (
    <div className="space-y-6 md:space-y-8 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-12 rounded bg-gray-200" />
        <div className="h-3 w-3 rounded bg-gray-100" />
        <div className="h-4 w-24 rounded bg-gray-200" />
      </div>
      {/* Title */}
      <div className="space-y-2">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="h-4 w-28 rounded bg-gray-100" />
      </div>
      {/* Search */}
      <div className="h-11 rounded-xl bg-gray-100" />
      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-gray-100 h-64" />
        ))}
      </div>
    </div>
  );
}
