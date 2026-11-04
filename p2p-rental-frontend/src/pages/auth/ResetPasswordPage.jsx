import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { ROUTES } from '@/constants/routes'
import PasswordInput from '@/components/ui/PasswordInput'

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(resetSchema),
  })

  const passwordValue = watch('password')

  const onSubmit = async (data) => {
    if (!token) {
      setError('root', { message: 'Invalid or expired reset token.' })
      return
    }

    try {
      // TODO: Call API to reset password with token and data.password
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess(true)
    } catch (err) {
      setError('root', { message: 'Failed to reset password. Please try again.' })
    }
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6 pt-20">
        <div className="w-full max-w-md glass rounded-2xl p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-neon-cyan/10 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-white mb-2">Password Reset</h3>
            <p className="text-carbon-400 text-sm">
              Your password has been successfully reset.
            </p>
          </div>
          <Link to={ROUTES.LOGIN} className="btn-primary w-full py-3 text-sm inline-block">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 pt-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-2 tracking-tight">Create New Password</h1>
          <p className="text-carbon-400 text-sm">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="glass rounded-2xl p-8 space-y-5" noValidate>
          {!token && (
             <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm mb-4">
               Missing reset token. Please request a new password reset link.
             </div>
          )}
          {errors.root && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
              {errors.root.message}
            </div>
          )}

          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-carbon-300 mb-1.5">New Password</label>
            <PasswordInput
              id="new-password"
              register={register('password')}
              error={errors.password}
              showStrength={true}
              value={passwordValue}
            />
          </div>

          <div>
            <label htmlFor="confirm-new-password" className="block text-sm font-medium text-carbon-300 mb-1.5">Confirm New Password</label>
            <PasswordInput
              id="confirm-new-password"
              register={register('confirmPassword')}
              error={errors.confirmPassword}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !token}
            className="btn-primary w-full py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
