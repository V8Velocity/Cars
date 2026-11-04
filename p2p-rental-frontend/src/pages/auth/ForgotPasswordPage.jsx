import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { ROUTES } from '@/constants/routes'

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async (data) => {
    try {
      // TODO: Call API to send reset link
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess(true)
    } catch (err) {
      setError('root', { message: 'Failed to send reset link. Please try again.' })
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 pt-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-2 tracking-tight">Reset Password</h1>
          <p className="text-carbon-400 text-sm">Enter your email and we'll send you a reset link</p>
        </div>

        <div className="glass rounded-2xl p-8">
          {success ? (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-neon-cyan/10 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Check your email</h3>
                <p className="text-carbon-400 text-sm">
                  We've sent password reset instructions to your email address.
                </p>
              </div>
              <Link to={ROUTES.LOGIN} className="btn-primary w-full py-3 text-sm inline-block">
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {errors.root && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
                  {errors.root.message}
                </div>
              )}

              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-carbon-300 mb-1.5">
                  Email
                </label>
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2.5 text-white placeholder-carbon-600 outline-none focus:border-neon-cyan/30 transition-colors text-sm"
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1.5" role="alert">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending link…' : 'Send Reset Link'}
              </button>

              <p className="text-center text-carbon-500 text-sm">
                Remember your password?{' '}
                <Link to={ROUTES.LOGIN} className="text-neon-cyan hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
