export default function LoadingSkeleton({ count = 9 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-carbon-900/60 border border-white/[0.04] overflow-hidden" aria-hidden="true">
          <div className="aspect-[4/3] bg-carbon-800 animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              <div className="h-4 w-14 bg-carbon-800 rounded animate-pulse" />
              <div className="h-4 w-12 bg-carbon-800 rounded animate-pulse" />
            </div>
            <div className="h-5 bg-carbon-800 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-carbon-800 rounded w-1/2 animate-pulse" />
            <div className="h-3 bg-carbon-800 rounded w-full animate-pulse" />
            <div className="flex justify-between pt-3 border-t border-white/[0.04]">
              <div className="h-6 w-20 bg-carbon-800 rounded animate-pulse" />
              <div className="h-7 w-16 bg-carbon-800 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
