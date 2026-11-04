import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 pt-20">
      <div className="text-center max-w-md">
        <div className="font-display text-[8rem] font-bold leading-none gradient-text mb-4" aria-hidden="true">
          404
        </div>
        <h1 className="font-display text-2xl font-bold text-white mb-3 tracking-tight">Page not found</h1>
        <p className="text-carbon-400 text-sm mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to={ROUTES.HOME} className="btn-primary text-sm px-6 py-2.5">
            Back to Home
          </Link>
          <Link to={ROUTES.VEHICLES} className="btn-outline text-sm px-6 py-2.5">
            Browse Cars
          </Link>
        </div>
      </div>
    </div>
  )
}
