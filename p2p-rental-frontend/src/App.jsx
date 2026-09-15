import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, OrbitControls, Float, MeshDistortMaterial } from '@react-three/drei'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import FeaturedCars from './components/FeaturedCars'
import HowItWorks from './components/HowItWorks'
import Stats from './components/Stats'
import Testimonials from './components/Testimonials'
import Footer from './components/Footer'
import './index.css'

gsap.registerPlugin(useGSAP)

function App() {
  return (
    <div className="relative min-h-screen bg-carbon-950 overflow-hidden">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <FeaturedCars />
        <HowItWorks />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}

export default App
