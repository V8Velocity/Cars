import { Outlet, ScrollRestoration } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

/**
 * Root layout — wraps all pages with Navbar, Footer, and scroll restoration.
 */
export default function RootLayout() {
  return (
    <div className="bg-carbon-950 min-h-screen text-white selection:bg-neon-cyan selection:text-black">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-neon-cyan focus:text-carbon-950 focus:rounded-lg focus:font-semibold focus:text-sm"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  )
}
