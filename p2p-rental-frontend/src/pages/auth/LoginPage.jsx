import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { ROUTES } from '@/constants/routes'
import PasswordInput from '@/components/ui/PasswordInput'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((s) => s.setAuth)

  const from = location.state?.from?.pathname || ROUTES.DASHBOARD

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    try {
      // TODO: Replace with real API call via useLogin() hook
      // const response = await authService.login(data)
      // Mock login for development:
      setAuth(
        { id: '1', email: data.email, name: 'Demo User', role: 'renter', kycVerified: true },
        'dev-token-' + Date.now()
      )
      navigate(from, { replace: true })
    } catch (err) {
      setError('root', { message: err.message || 'Invalid email or password' })
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 pt-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-2 tracking-tight">Welcome back</h1>
          <p className="text-carbon-400 text-sm">Sign in to your DriveShare account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="glass rounded-2xl p-8 space-y-5" noValidate>
          {errors.root && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
              {errors.root.message}
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-carbon-300 mb-1.5">
              Email
            </label>
            <input
              id="login-email"
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

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-carbon-300 mb-1.5">
              Password
            </label>
            <PasswordInput
              id="login-password"
              register={register('password')}
              error={errors.password}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>

          <p className="text-center text-carbon-500 text-sm">
            Don&apos;t have an account?{' '}
            <Link to={ROUTES.REGISTER} className="text-neon-cyan hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
