export default function AdminMessagesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-28 rounded bg-gray-200" />
        <div className="h-4 w-48 rounded bg-gray-100" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-5 w-36 rounded bg-gray-200" />
            <div className="h-4 w-24 rounded bg-gray-100" />
          </div>
          <div className="h-4 w-48 rounded bg-gray-100" />
          <div className="h-4 w-full rounded bg-gray-100" />
          <div className="h-4 w-3/4 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}
