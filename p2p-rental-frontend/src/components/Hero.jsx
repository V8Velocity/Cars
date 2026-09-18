import { useRef, Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { useProgress } from '@react-three/drei'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import * as THREE from 'three'
import CarScene from './CarScene'

// Loading progress overlay
function LoadingOverlay() {
  const { progress, active } = useProgress()

  if (!active) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-neon-cyan/20 border-t-neon-cyan rounded-full animate-spin" />
        <span className="text-carbon-400 text-sm font-medium tracking-wide">Loading 3D Model...</span>
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
  const ctaRef = useRef()
  const searchRef = useRef()
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
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
    tl.from(headlineRef.current, { y: 80, opacity: 0, duration: 1.2 })
      .from(subtextRef.current, { y: 50, opacity: 0, duration: 0.9 }, '-=0.7')
      .from(ctaRef.current, { y: 40, opacity: 0, duration: 0.8 }, '-=0.5')
      .from(searchRef.current, { y: 30, opacity: 0, duration: 0.7 }, '-=0.4')
  }, { scope: containerRef })

  return (
    <section className="relative w-full min-h-screen flex flex-col overflow-hidden" ref={containerRef}>
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-screen"
        style={{ zIndex: 0 }}
      >
        <source src="/Smooth_looping_D_tracking_sho.mp4" type="video/mp4" />
      </video>

      {/* Background orbs */}
      <div className="orb w-[500px] h-[500px] bg-neon-cyan/10 top-10 left-1/3 z-0" />
      <div className="orb w-[300px] h-[300px] bg-white/5 bottom-20 right-1/4 z-0" />

      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-carbon-950 to-transparent z-[1]" />

      {/* 3D Canvas */}
      <div
        ref={canvasWrapperRef}
        className="absolute inset-0 z-0"
        style={{ contain: 'layout style paint' }}
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
      <div className="relative z-10 flex flex-col justify-center min-h-screen px-6 max-w-7xl mx-auto w-full pt-24">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
            <span className="text-xs font-medium text-carbon-300 tracking-wide">P2P Car Rentals · 50,000+ Verified Drivers</span>
          </div>

          {/* Headline */}
          <h1 ref={headlineRef} className="font-display text-6xl md:text-7xl lg:text-[5.5rem] font-bold text-white leading-[0.95] mb-8 tracking-tight">
            Rent Any Car.<br />
            <span className="gradient-text">Anywhere.</span><br />
            <span className="text-carbon-500">Anytime.</span>
          </h1>

          {/* Subtext */}
          <p ref={subtextRef} className="text-carbon-400 text-lg max-w-lg leading-relaxed mb-10">
            Connect with verified local owners. Premium vehicles at honest prices — from everyday rides to weekend supercars.
          </p>

          {/* CTA Buttons */}
          <div ref={ctaRef} className="flex flex-wrap gap-4 mb-12">
            <button className="btn-primary text-sm px-8 py-3.5 font-semibold">
              Browse Cars
            </button>
            <button className="btn-outline text-sm px-8 py-3.5 group">
              List Your Car
              <span className="inline-block ml-1 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          {/* Search Bar */}
          <div ref={searchRef} className="glass rounded-xl p-1.5 flex flex-col sm:flex-row gap-1 max-w-xl shimmer-border">
            <div className="flex items-center gap-3 flex-1 px-4 py-2.5">
              <svg className="w-4 h-4 text-carbon-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                type="text"
                placeholder="City, airport, or address..."
                className="bg-transparent border-none outline-none text-white w-full placeholder-carbon-600 text-sm"
              />
            </div>
            <button className="btn-primary rounded-lg px-6 py-2.5 text-xs flex items-center gap-2 font-semibold">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
        <div className="w-5 h-8 rounded-full border border-white/10 flex justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-neon-cyan" />
        </div>
      </div>
    </section>
  )
}
