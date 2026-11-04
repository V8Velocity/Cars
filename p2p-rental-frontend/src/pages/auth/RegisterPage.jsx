import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { ROUTES } from '@/constants/routes'
import PasswordInput from '@/components/ui/PasswordInput'

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    phone: z.string().min(10, 'Enter a valid phone number'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
    role: z.enum(['renter', 'owner'], { required_error: 'Select a role' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export default function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'renter' },
  })

  const passwordValue = watch('password')

  const onSubmit = async (data) => {
    try {
      // TODO: Replace with real API call via useRegister() hook
      setAuth(
        { id: '1', email: data.email, name: data.name, role: data.role, kycVerified: false },
        'dev-token-' + Date.now()
      )
      navigate(ROUTES.KYC)
    } catch (err) {
      setError('root', { message: err.message || 'Registration failed' })
    }
  }

  const inputCls =
    'w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2.5 text-white placeholder-carbon-600 outline-none focus:border-neon-cyan/30 transition-colors text-sm'

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 pt-20 pb-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-2 tracking-tight">Create your account</h1>
          <p className="text-carbon-400 text-sm">Join the DriveShare community</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="glass rounded-2xl p-8 space-y-5" noValidate>
          {errors.root && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
              {errors.root.message}
            </div>
          )}

          <div>
            <label htmlFor="reg-name" className="block text-sm font-medium text-carbon-300 mb-1.5">Full Name</label>
            <input id="reg-name" type="text" autoComplete="name" {...register('name')} className={inputCls} placeholder="John Doe" />
            {errors.name && <p className="text-red-400 text-xs mt-1.5" role="alert">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-carbon-300 mb-1.5">Email</label>
            <input id="reg-email" type="email" autoComplete="email" {...register('email')} className={inputCls} placeholder="you@example.com" />
            {errors.email && <p className="text-red-400 text-xs mt-1.5" role="alert">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="reg-phone" className="block text-sm font-medium text-carbon-300 mb-1.5">Phone Number</label>
            <input id="reg-phone" type="tel" autoComplete="tel" {...register('phone')} className={inputCls} placeholder="+1 (555) 000-0000" />
            {errors.phone && <p className="text-red-400 text-xs mt-1.5" role="alert">{errors.phone.message}</p>}
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-carbon-300 mb-1.5">Password</label>
            <PasswordInput
              id="reg-password"
              register={register('password')}
              error={errors.password}
              showStrength={true}
              value={passwordValue}
            />
          </div>

          <div>
            <label htmlFor="reg-confirm" className="block text-sm font-medium text-carbon-300 mb-1.5">Confirm Password</label>
            <PasswordInput
              id="reg-confirm"
              register={register('confirmPassword')}
              error={errors.confirmPassword}
            />
          </div>

          {/* Role Selector */}
          <fieldset>
            <legend className="block text-sm font-medium text-carbon-300 mb-2">I want to</legend>
            <div className="grid grid-cols-2 gap-3">
              <label className="relative cursor-pointer">
                <input type="radio" value="renter" {...register('role')} className="peer sr-only" />
                <div className="rounded-lg border border-white/[0.06] px-4 py-3 text-center text-sm text-carbon-400 peer-checked:border-neon-cyan/30 peer-checked:text-neon-cyan peer-checked:bg-neon-cyan/[0.05] transition-all">
                  Rent a car
                </div>
              </label>
              <label className="relative cursor-pointer">
                <input type="radio" value="owner" {...register('role')} className="peer sr-only" />
                <div className="rounded-lg border border-white/[0.06] px-4 py-3 text-center text-sm text-carbon-400 peer-checked:border-neon-cyan/30 peer-checked:text-neon-cyan peer-checked:bg-neon-cyan/[0.05] transition-all">
                  List my car
                </div>
              </label>
            </div>
            {errors.role && <p className="text-red-400 text-xs mt-1.5" role="alert">{errors.role.message}</p>}
          </fieldset>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </button>

          <p className="text-center text-carbon-500 text-sm">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="text-neon-cyan hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
