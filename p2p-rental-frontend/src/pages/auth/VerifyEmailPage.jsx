import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState('verifying') // verifying | success | error

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }

    const verify = async () => {
      try {
        // TODO: Call API to verify email with token
        await new Promise(resolve => setTimeout(resolve, 1500))
        setStatus('success')
      } catch (err) {
        setStatus('error')
      }
    }

    verify()
  }, [token])

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 pt-20">
      <div className="w-full max-w-md glass rounded-2xl p-8 text-center space-y-6">
        
        {status === 'verifying' && (
          <>
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
               <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">Verifying Email</h3>
              <p className="text-carbon-400 text-sm">Please wait while we verify your email address...</p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-neon-cyan/10 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">Email Verified</h3>
              <p className="text-carbon-400 text-sm mb-6">
                Your email address has been successfully verified.
              </p>
              <Link to={ROUTES.LOGIN} className="btn-primary w-full py-3 text-sm inline-block">
                Continue to Login
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">Verification Failed</h3>
              <p className="text-carbon-400 text-sm mb-6">
                The verification link is invalid or has expired.
              </p>
              <Link to={ROUTES.LOGIN} className="btn-primary w-full py-3 text-sm inline-block">
                Return to Login
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
