export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  // Build a window of page numbers around the current page
  const getPages = () => {
    const pages = []
    const start = Math.max(1, page - 2)
    const end = Math.min(totalPages, page + 2)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  const pages = getPages()
  const btnBase = 'w-9 h-9 rounded-lg text-xs font-medium transition-colors flex items-center justify-center'

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-12" aria-label="Pagination">
      {/* Prev */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-2 rounded-lg text-xs text-carbon-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        ← Prev
      </button>

      {/* First page + ellipsis */}
      {pages[0] > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className={`${btnBase} text-carbon-400 hover:text-white hover:bg-white/[0.03]`}>1</button>
          {pages[0] > 2 && <span className="text-carbon-600 px-1 text-xs">…</span>}
        </>
      )}

      {/* Page numbers */}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`${btnBase} ${
            p === page
              ? 'bg-neon-cyan text-carbon-950 shadow-lg shadow-neon-cyan/20'
              : 'text-carbon-400 hover:text-white hover:bg-white/[0.03]'
          }`}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </button>
      ))}

      {/* Last page + ellipsis */}
      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="text-carbon-600 px-1 text-xs">…</span>}
          <button onClick={() => onPageChange(totalPages)} className={`${btnBase} text-carbon-400 hover:text-white hover:bg-white/[0.03]`}>{totalPages}</button>
        </>
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-2 rounded-lg text-xs text-carbon-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        Next →
      </button>
    </nav>
  )
}
