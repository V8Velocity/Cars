import Hero from './Hero'
import Stats from './Stats'
import FeaturedFleet from './FeaturedFleet'
import HowItWorks from './HowItWorks'
import Testimonials from './Testimonials'

/**
 * Home page — composes all landing page sections.
 * Each section is co-located in src/pages/home/.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <FeaturedFleet />
      <HowItWorks />
      <Testimonials />
    </>
  )
}
