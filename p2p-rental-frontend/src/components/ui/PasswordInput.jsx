import { useState, useMemo } from 'react'

const calculateStrength = (password) => {
  let score = 0
  if (!password) return score
  if (password.length >= 8) score += 1
  if (password.match(/[A-Z]/)) score += 1
  if (password.match(/[0-9]/)) score += 1
  if (password.match(/[^A-Za-z0-9]/)) score += 1
  if (password.length >= 12) score += 1
  return Math.min(score, 4)
}

const STRENGTH_LABELS = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent']
const STRENGTH_COLORS = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-500']

export default function PasswordInput({ 
  id, 
  register, 
  error, 
  placeholder = '••••••••', 
  showStrength = false, 
  value = '' 
}) {
  const [show, setShow] = useState(false)
  const strength = useMemo(() => calculateStrength(value), [value])

  return (
    <div>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={id.includes('new') || id.includes('confirm') ? 'new-password' : 'current-password'}
          {...register}
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg pl-4 pr-10 py-2.5 text-white placeholder-carbon-600 outline-none focus:border-neon-cyan/30 transition-colors text-sm"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-carbon-400 hover:text-white transition-colors"
          tabIndex="-1"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
      
      {showStrength && value && (
        <div className="mt-2 space-y-1">
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((step) => (
              <div 
                key={step} 
                className={`h-1 w-full rounded-full transition-colors duration-300 ${
                  strength > step ? STRENGTH_COLORS[strength] : 'bg-white/[0.06]'
                }`}
              />
            ))}
          </div>
          <div className="text-[10px] text-right text-carbon-400">
            {STRENGTH_LABELS[strength]}
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-xs mt-1.5" role="alert">{error.message}</p>
      )}
    </div>
  )
}
