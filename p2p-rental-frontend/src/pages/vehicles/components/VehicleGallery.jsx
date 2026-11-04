import { useState, useCallback, useEffect } from 'react'

export default function VehicleGallery({ images, name }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)

  const goTo = useCallback((i) => setActiveIndex(Math.max(0, Math.min(images.length - 1, i))), [images.length])

  // Keyboard navigation in fullscreen
  useEffect(() => {
    if (!fullscreen) return
    const handleKey = (e) => {
      if (e.key === 'Escape') setFullscreen(false)
      if (e.key === 'ArrowRight') goTo(activeIndex + 1)
      if (e.key === 'ArrowLeft') goTo(activeIndex - 1)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [fullscreen, activeIndex, goTo])

  return (
    <div>
      {/* Main Image */}
      <div
        className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-carbon-900 cursor-pointer group"
        onClick={() => setFullscreen(true)}
        role="button"
        tabIndex={0}
        aria-label={`View ${name} gallery fullscreen`}
        onKeyDown={(e) => e.key === 'Enter' && setFullscreen(true)}
      >
        <img
          src={images[activeIndex]}
          alt={`${name} — photo ${activeIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-carbon-900/40 via-transparent to-transparent" aria-hidden="true" />

        {/* Counter badge */}
        <div className="absolute bottom-4 right-4 glass rounded-lg px-3 py-1.5 text-xs text-carbon-300 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          {activeIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
              i === activeIndex
                ? 'border-neon-cyan ring-1 ring-neon-cyan/30'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            aria-label={`View photo ${i + 1}`}
            aria-current={i === activeIndex ? 'true' : undefined}
          >
            <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>

      {/* Fullscreen Overlay */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center" role="dialog" aria-label="Image gallery">
          {/* Close */}
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-carbon-400 hover:text-white transition-colors z-10"
            aria-label="Close gallery"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {/* Prev */}
          {activeIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); goTo(activeIndex - 1) }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-carbon-400 hover:text-white transition-colors"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}

          {/* Main fullscreen image */}
          <img
            src={images[activeIndex]}
            alt={`${name} — photo ${activeIndex + 1}`}
            className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg"
          />

          {/* Next */}
          {activeIndex < images.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goTo(activeIndex + 1) }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-carbon-400 hover:text-white transition-colors"
              aria-label="Next image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
            </button>
          )}

          {/* Fullscreen thumbnails */}
          <div className="flex gap-2 mt-6">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setActiveIndex(i) }}
                className={`w-16 h-11 rounded-lg overflow-hidden border-2 transition-all ${
                  i === activeIndex ? 'border-neon-cyan' : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
