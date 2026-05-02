export default function OrdersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-40 rounded bg-gray-200" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-5 w-28 rounded bg-gray-200" />
            <div className="h-6 w-20 rounded-full bg-gray-100" />
          </div>
          <div className="h-4 w-48 rounded bg-gray-100" />
          <div className="grid grid-cols-3 gap-2 pt-1">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="h-16 rounded-xl bg-gray-100" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
