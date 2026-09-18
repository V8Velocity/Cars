import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import FeaturedFleet from './components/FeaturedFleet'
import HowItWorks from './components/HowItWorks'
import Testimonials from './components/Testimonials'
import Footer from './components/Footer'
import './index.css'

gsap.registerPlugin(useGSAP)

export default function App() {
  return (
    <main className="bg-carbon-950 min-h-screen text-white selection:bg-neon-cyan selection:text-black">
      <Navbar />
      <Hero />
      <FeaturedFleet />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </main>
  )
}
