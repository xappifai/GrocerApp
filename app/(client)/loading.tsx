export default function ClientLoading() {
  return (
    <div className="space-y-10 md:space-y-14 animate-pulse">
      {/* Hero skeleton */}
      <div className="h-52 rounded-2xl bg-brand-200 md:h-64 md:rounded-3xl" />

      {/* Category shortcut skeleton — mobile */}
      <div className="md:hidden">
        <div className="mb-3 h-3 w-32 rounded bg-gray-200" />
        <div className="grid grid-cols-4 gap-2.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-gray-100" />
          ))}
        </div>
      </div>

      {/* Search bar skeleton */}
      <div className="h-11 rounded-xl bg-gray-100" />

      {/* Section skeletons */}
      {Array.from({ length: 3 }).map((_, s) => (
        <div key={s} className="space-y-4">
          {/* Section header */}
          <div className="flex items-center justify-between">
            <div className="h-6 w-36 rounded bg-gray-200" />
            <div className="h-8 w-20 rounded-xl bg-gray-100" />
          </div>
          {/* Cards — desktop grid */}
          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-gray-100 h-64" />
            ))}
          </div>
          {/* Cards — mobile row */}
          <div className="flex gap-3 md:hidden overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-44 flex-shrink-0 rounded-2xl bg-gray-100 h-56" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
