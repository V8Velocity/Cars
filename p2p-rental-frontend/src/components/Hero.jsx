import { useRef, Suspense, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, OrbitControls, useGLTF, ContactShadows, Float, Sphere, MeshDistortMaterial } from '@react-three/drei'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import * as THREE from 'three'

// --------------------------------------------------
// 3D Scene Components
// --------------------------------------------------

function BMWModel() {
  const { scene } = useGLTF('/bmw.glb')
  const modelRef = useRef()

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [scene])

  useFrame((state) => {
    if (modelRef.current) {
      modelRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.25 + Math.PI * 0.1
      modelRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02 - 0.8
    }
  })

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={1.2}
      position={[0, -0.8, 0]}
      rotation={[0, Math.PI * 0.1, 0]}
    />
  )
}

function FloatingSphere({ position, scale, color, speed, distort, opacity }) {
  const meshRef = useRef()
  useFrame((state) => {
    meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.2
    meshRef.current.rotation.z = state.clock.elapsedTime * speed * 0.3
  })
  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.6}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <sphereGeometry args={[1, 48, 48]} />
        <MeshDistortMaterial
          color={color}
          roughness={0.15}
          metalness={0.95}
          distort={distort}
          speed={1.5}
          transparent
          opacity={opacity || 0.6}
        />
      </mesh>
    </Float>
  )
}

function GroundGrid() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.01, 0]}>
      <planeGeometry args={[30, 30, 60, 60]} />
      <meshBasicMaterial color="#00f0ff" wireframe transparent opacity={0.03} />
    </mesh>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 8, 5]} intensity={0.6} color="#ffffff" castShadow />
      <spotLight position={[-8, 6, 3]} angle={0.25} penumbra={1} intensity={0.5} color="#00f0ff" />
      <spotLight position={[8, 4, -3]} angle={0.3} penumbra={1} intensity={0.3} color="#ffffff" />
      <pointLight position={[0, -0.5, 3]} intensity={0.2} color="#00f0ff" distance={8} />

      <Environment preset="night" />

      <BMWModel />

      <ContactShadows
        position={[0, -1, 0]}
        opacity={0.4}
        scale={12}
        blur={2.5}
        far={4}
        color="#00f0ff"
      />

      <GroundGrid />

      <FloatingSphere position={[5, 2, -5]} scale={0.6} color="#00f0ff" speed={0.2} distort={0.4} opacity={0.25} />
      <FloatingSphere position={[-5.5, -0.5, -4]} scale={0.35} color="#ffffff" speed={0.4} distort={0.5} opacity={0.15} />
      <FloatingSphere position={[4, -1.5, -6]} scale={0.25} color="#00f0ff" speed={0.6} distort={0.3} opacity={0.2} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.3}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  )
}

// Loading fallback
function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-20">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-neon-cyan/20 border-t-neon-cyan rounded-full animate-spin" />
        <span className="text-carbon-400 text-sm font-medium tracking-wide">Loading 3D Model...</span>
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

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
    tl.from(headlineRef.current, { y: 80, opacity: 0, duration: 1.2 })
      .from(subtextRef.current, { y: 50, opacity: 0, duration: 0.9 }, '-=0.7')
      .from(ctaRef.current, { y: 40, opacity: 0, duration: 0.8 }, '-=0.5')
      .from(searchRef.current, { y: 30, opacity: 0, duration: 0.7 }, '-=0.4')
  }, { scope: containerRef })

  return (
    <section className="relative w-full min-h-screen flex flex-col overflow-hidden" ref={containerRef}>
      {/* Background orbs */}
      <div className="orb w-[500px] h-[500px] bg-neon-cyan/10 top-10 left-1/3" />
      <div className="orb w-[300px] h-[300px] bg-white/5 bottom-20 right-1/4" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-carbon-950 to-transparent z-[1]" />

      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [4, 1.5, 5], fov: 45 }}
          gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
          style={{ background: 'transparent' }}
          shadows
        >
          <Suspense fallback={
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color="red" wireframe />
            </mesh>
          }>
            <Scene />
          </Suspense>
        </Canvas>
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

// Preload the GLB model
useGLTF.preload('/bmw.glb')
