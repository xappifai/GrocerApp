export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse">
      <div className="mb-6 h-5 w-24 rounded bg-gray-200" />
      <div className="grid gap-10 md:grid-cols-2">
        {/* Image */}
        <div className="aspect-square rounded-3xl bg-gray-100" />
        {/* Details */}
        <div className="space-y-5">
          <div className="h-4 w-24 rounded-full bg-gray-100" />
          <div className="space-y-2">
            <div className="h-8 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-full rounded bg-gray-100" />
            <div className="h-4 w-2/3 rounded bg-gray-100" />
          </div>
          <div className="h-9 w-32 rounded bg-gray-200" />
          <div className="h-12 rounded-2xl bg-brand-100" />
        </div>
      </div>
    </div>
  );
}
