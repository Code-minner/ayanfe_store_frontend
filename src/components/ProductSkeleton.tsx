export default function ProductSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
          <div className="aspect-[4/3.4] animate-shimmer rounded-xl bg-neutral-100" />
          <div className="mt-3 space-y-2">
            <div className="h-3 w-1/3 animate-shimmer rounded bg-neutral-100" />
            <div className="h-4 w-4/5 animate-shimmer rounded bg-neutral-100" />
            <div className="h-4 w-1/2 animate-shimmer rounded bg-neutral-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
