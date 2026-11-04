import { useRef, Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { useProgress } from '@react-three/drei'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import * as THREE from 'three'
import CarScene from './CarScene'
import SearchBar from '@/components/booking/SearchBar'

// Loading progress overlay
function LoadingOverlay() {
  const { progress, active } = useProgress()

  if (!active) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-neon-cyan/20 border-t-neon-cyan rounded-full animate-spin" />
        <span className="text-carbon-400 text-sm font-medium tracking-wide">Loading 3D Model…</span>
        <div className="w-48 h-1 bg-carbon-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-neon-cyan rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-carbon-600 text-xs">{Math.round(progress)}%</span>
      </div>
    </div>
  )
}

// Car silhouette fallback when 3D model fails
function ModelErrorFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <div className="relative">
        <svg
          viewBox="0 0 400 160"
          className="w-[500px] max-w-[80vw] opacity-20"
          fill="none"
          stroke="#00f0ff"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M50 120 L80 80 L140 60 L260 60 L320 80 L350 120" strokeLinejoin="round" />
          <line x1="30" y1="120" x2="370" y2="120" />
          <circle cx="110" cy="120" r="20" />
          <circle cx="110" cy="120" r="12" />
          <circle cx="290" cy="120" r="20" />
          <circle cx="290" cy="120" r="12" />
          <path d="M140 60 L150 80 L250 80 L260 60" />
          <path d="M80 80 L140 80" />
          <path d="M260 80 L320 80" />
        </svg>
        <div className="absolute inset-0 bg-neon-cyan/5 blur-3xl rounded-full" />
      </div>
    </div>
  )
}

// --------------------------------------------------
// Hero Section
// --------------------------------------------------

export default function Hero() {
  const containerRef = useRef()
  const headlineRef = useRef()
  const subtextRef = useRef()
  const searchRef = useRef()
  const ctaRef = useRef()
  const canvasWrapperRef = useRef()
  const [isVisible, setIsVisible] = useState(true)
  const [canvasError, setCanvasError] = useState(false)

  // Pause 3D rendering when hero is scrolled out of viewport
  useEffect(() => {
    const el = canvasWrapperRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      gsap.set([headlineRef.current, subtextRef.current, searchRef.current, ctaRef.current], {
        opacity: 1,
        y: 0,
      })
      return
    }

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
    tl.from(headlineRef.current, { y: 80, opacity: 0, duration: 1.2 })
      .from(subtextRef.current, { y: 50, opacity: 0, duration: 0.9 }, '-=0.7')
      .from(searchRef.current, { y: 40, opacity: 0, duration: 0.8 }, '-=0.5')
      .from(ctaRef.current, { y: 30, opacity: 0, duration: 0.7 }, '-=0.4')
  }, { scope: containerRef })

  return (
    <section className="relative w-full min-h-screen flex flex-col overflow-hidden" ref={containerRef}>
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen"
        style={{ zIndex: 0 }}
      >
        <source src="/Smooth_looping_D_tracking_sho.mp4" type="video/mp4" />
      </video>

      {/* Background orbs */}
      <div className="orb w-[500px] h-[500px] bg-neon-cyan/10 top-10 left-1/3 z-0" aria-hidden="true" />
      <div className="orb w-[300px] h-[300px] bg-white/5 bottom-20 right-1/4 z-0" aria-hidden="true" />

      {/* Gradient fades for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-carbon-950/80 via-carbon-950/40 to-transparent z-[1]" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 right-0 h-60 bg-gradient-to-t from-carbon-950 via-carbon-950/80 to-transparent z-[1]" aria-hidden="true" />

      {/* 3D Canvas */}
      <div
        ref={canvasWrapperRef}
        className="absolute inset-0 z-0"
        style={{ contain: 'layout style paint' }}
        aria-hidden="true"
      >
        {canvasError ? (
          <ModelErrorFallback />
        ) : (
          <>
            <LoadingOverlay />
            <Canvas
              dpr={[1, 1.5]}
              camera={{ position: [4, 1.5, 5], fov: 45 }}
              frameloop={isVisible ? 'always' : 'never'}
              gl={{
                powerPreference: 'high-performance',
                antialias: true,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.2,
                alpha: true,
              }}
              style={{ background: 'transparent' }}
              shadows
              onCreated={(state) => {
                state.gl.setClearColor(0x000000, 0)
              }}
            >
              <Suspense fallback={null}>
                <CarScene />
              </Suspense>
            </Canvas>
          </>
        )}
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col justify-center min-h-screen px-6 max-w-7xl mx-auto w-full pt-28 pb-20">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" aria-hidden="true" />
            <span className="text-xs font-medium text-carbon-300 tracking-wide">P2P Car Rentals · 50,000+ Verified Drivers</span>
          </div>

          {/* Headline */}
          <h1 ref={headlineRef} className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold text-white leading-[0.95] mb-6 tracking-tight">
            Rent Any Car.<br />
            <span className="gradient-text">Anywhere.</span><br />
            <span className="text-carbon-400">Anytime.</span>
          </h1>

          {/* Subtext */}
          <p ref={subtextRef} className="text-carbon-300 text-lg max-w-lg leading-relaxed mb-10">
            Connect with verified local owners. Premium vehicles at honest prices — from everyday rides to weekend supercars.
          </p>

          {/* Search Bar — Primary Action */}
          <div ref={searchRef} className="mb-8">
            <SearchBar />
          </div>

          {/* CTA Buttons — Secondary Actions */}
          <div ref={ctaRef} className="flex flex-wrap gap-4">
            <button className="btn-primary text-sm px-8 py-3.5 font-semibold">
              Browse All Cars
            </button>
            <button className="btn-outline text-sm px-8 py-3.5 group">
              List Your Car
              <span className="inline-block ml-1 group-hover:translate-x-1 transition-transform" aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator — static, no animation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 opacity-40" aria-hidden="true">
        <div className="w-5 h-8 rounded-full border border-white/10 flex justify-center pt-2">
          <div className="w-1 h-1.5 rounded-full bg-white/50" />
        </div>
      </div>
    </section>
  )
}
