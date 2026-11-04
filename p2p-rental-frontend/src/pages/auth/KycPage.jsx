import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/store/auth'
import KYCProgress from './components/KYCProgress'
import DocumentUpload from './components/DocumentUpload'
import VerificationTimeline from './components/VerificationTimeline'

const STEPS = [
  { id: 'personal', label: 'Personal Info' },
  { id: 'phone', label: 'Phone Verification' },
  { id: 'driver', label: 'Driver Details' },
  { id: 'identity', label: 'Identity' },
  { id: 'status', label: 'Status' }
]

const personalSchema = z.object({
  dob: z.string().min(1, 'Date of birth is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip: z.string().min(5, 'ZIP is required'),
})

const driverSchema = z.object({
  licenseNumber: z.string().min(5, 'License number is required'),
  licenseState: z.string().min(2, 'State is required'),
  expirationDate: z.string().min(1, 'Expiration date is required'),
})

export default function KycPage() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()
  
  // If user is already fully verified, maybe redirect them, but for now just show timeline if they have a status
  const initialStep = user?.kycStatus ? 4 : 0
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [kycStatus, setKycStatus] = useState(user?.kycStatus || 'UNVERIFIED')

  const inputCls = "w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2.5 text-white placeholder-carbon-600 outline-none focus:border-neon-cyan/30 transition-colors text-sm"

  // Step 1: Personal Info
  const personalForm = useForm({ resolver: zodResolver(personalSchema) })
  const onPersonalSubmit = (data) => {
    updateUser({ ...data })
    setCurrentStep(1)
  }

  // Step 2: Phone Verification
  const [otp, setOtp] = useState('')
  const onPhoneSubmit = (e) => {
    e.preventDefault()
    if (otp.length === 6) {
      setCurrentStep(2)
    }
  }

  // Step 3: Driver Details
  const driverForm = useForm({ resolver: zodResolver(driverSchema) })
  const onDriverSubmit = (data) => {
    updateUser({ ...data })
    setCurrentStep(3)
  }

  // Step 4: Identity (Document Upload)
  const [frontImage, setFrontImage] = useState(null)
  const [backImage, setBackImage] = useState(null)
  const [selfieImage, setSelfieImage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onIdentitySubmit = async () => {
    if (!frontImage || !backImage || !selfieImage) return
    setIsSubmitting(true)
    
    try {
      // Mock API call to submit KYC
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newStatus = 'PENDING'
      setKycStatus(newStatus)
      updateUser({ kycStatus: newStatus })
      setCurrentStep(4)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 px-6 pb-20">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-bold text-white mb-2 tracking-tight">Identity Verification</h1>
          <p className="text-carbon-400">Complete your profile to start using DriveShare.</p>
        </div>

        <div className="mb-12 hidden md:block">
          <KYCProgress steps={STEPS} currentStep={currentStep} />
        </div>

        <div className="glass rounded-2xl p-6 md:p-10">
          
          {/* STEP 1: Personal Info */}
          {currentStep === 0 && (
            <form onSubmit={personalForm.handleSubmit(onPersonalSubmit)} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-medium text-white mb-6">Personal Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-carbon-300 mb-1.5">Date of Birth</label>
                <input type="date" {...personalForm.register('dob')} className={inputCls} />
                {personalForm.formState.errors.dob && <p className="text-red-400 text-xs mt-1.5">{personalForm.formState.errors.dob.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-carbon-300 mb-1.5">Street Address</label>
                <input type="text" {...personalForm.register('address')} className={inputCls} placeholder="123 Main St" />
                {personalForm.formState.errors.address && <p className="text-red-400 text-xs mt-1.5">{personalForm.formState.errors.address.message}</p>}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-carbon-300 mb-1.5">City</label>
                  <input type="text" {...personalForm.register('city')} className={inputCls} placeholder="San Francisco" />
                  {personalForm.formState.errors.city && <p className="text-red-400 text-xs mt-1.5">{personalForm.formState.errors.city.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-carbon-300 mb-1.5">State</label>
                  <input type="text" {...personalForm.register('state')} className={inputCls} placeholder="CA" />
                  {personalForm.formState.errors.state && <p className="text-red-400 text-xs mt-1.5">{personalForm.formState.errors.state.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-carbon-300 mb-1.5">ZIP Code</label>
                  <input type="text" {...personalForm.register('zip')} className={inputCls} placeholder="94105" />
                  {personalForm.formState.errors.zip && <p className="text-red-400 text-xs mt-1.5">{personalForm.formState.errors.zip.message}</p>}
                </div>
              </div>

              <button type="submit" className="btn-primary w-full py-3 mt-4">Continue</button>
            </form>
          )}

          {/* STEP 2: Phone Verification */}
          {currentStep === 1 && (
            <form onSubmit={onPhoneSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
              <h2 className="text-xl font-medium text-white mb-2">Verify your phone</h2>
              <p className="text-carbon-400 text-sm mb-8">We sent a 6-digit code to your phone number.</p>
              
              <div className="max-w-xs mx-auto">
                <label className="block text-sm font-medium text-carbon-300 mb-1.5 text-left">Verification Code</label>
                <input 
                  type="text" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={`${inputCls} text-center tracking-[0.5em] text-lg font-mono`} 
                  placeholder="------" 
                />
              </div>

              <div className="flex gap-4 pt-4 max-w-xs mx-auto">
                <button type="button" onClick={() => setCurrentStep(0)} className="btn-secondary w-full py-3">Back</button>
                <button type="submit" disabled={otp.length !== 6} className="btn-primary w-full py-3 disabled:opacity-50">Verify</button>
              </div>
            </form>
          )}

          {/* STEP 3: Driver Details */}
          {currentStep === 2 && (
            <form onSubmit={driverForm.handleSubmit(onDriverSubmit)} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-medium text-white mb-6">Driver's License Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-carbon-300 mb-1.5">License Number</label>
                <input type="text" {...driverForm.register('licenseNumber')} className={inputCls} placeholder="D1234567" />
                {driverForm.formState.errors.licenseNumber && <p className="text-red-400 text-xs mt-1.5">{driverForm.formState.errors.licenseNumber.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-carbon-300 mb-1.5">Issuing State</label>
                  <input type="text" {...driverForm.register('licenseState')} className={inputCls} placeholder="CA" />
                  {driverForm.formState.errors.licenseState && <p className="text-red-400 text-xs mt-1.5">{driverForm.formState.errors.licenseState.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-carbon-300 mb-1.5">Expiration Date</label>
                  <input type="date" {...driverForm.register('expirationDate')} className={inputCls} />
                  {driverForm.formState.errors.expirationDate && <p className="text-red-400 text-xs mt-1.5">{driverForm.formState.errors.expirationDate.message}</p>}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setCurrentStep(1)} className="btn-secondary w-full py-3">Back</button>
                <button type="submit" className="btn-primary w-full py-3">Continue</button>
              </div>
            </form>
          )}

          {/* STEP 4: Identity (Document Upload) */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-xl font-medium text-white mb-2">Upload Documents</h2>
                <p className="text-carbon-400 text-sm">Please provide clear photos of your driver's license and a selfie.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DocumentUpload 
                  id="front-id" 
                  label="Front of License" 
                  onUpload={setFrontImage}
                  value={frontImage}
                />
                <DocumentUpload 
                  id="back-id" 
                  label="Back of License" 
                  onUpload={setBackImage}
                  value={backImage}
                />
              </div>
              
              <div className="max-w-md mx-auto">
                <DocumentUpload 
                  id="selfie" 
                  label="Selfie" 
                  description="Take a selfie in a well-lit area"
                  onUpload={setSelfieImage}
                  value={selfieImage}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setCurrentStep(2)} className="btn-secondary w-full py-3" disabled={isSubmitting}>Back</button>
                <button 
                  onClick={onIdentitySubmit} 
                  disabled={!frontImage || !backImage || !selfieImage || isSubmitting} 
                  className="btn-primary w-full py-3 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Verification'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Status */}
          {currentStep === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <VerificationTimeline status={kycStatus} />
               
               <div className="mt-10 flex gap-4">
                 <button onClick={() => navigate(ROUTES.DASHBOARD)} className="btn-primary flex-1 py-3">Go to Dashboard</button>
                 {kycStatus === 'REJECTED' && (
                   <button onClick={() => { setKycStatus('UNVERIFIED'); setCurrentStep(0); }} className="btn-secondary flex-1 py-3">Retry Verification</button>
                 )}
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
