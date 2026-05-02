export default function ProfileLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-32 rounded bg-gray-200" />
      <div className="rounded-2xl bg-white p-6 shadow-card space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="h-10 rounded-xl bg-gray-100" />
          </div>
        ))}
        <div className="h-10 w-32 rounded-xl bg-brand-100 mt-2" />
      </div>
    </div>
  );
}
