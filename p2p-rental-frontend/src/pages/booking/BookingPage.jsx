import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { vehicleService } from '@/services/vehicles'
import { bookingService } from '@/services/bookings'
import { useAuthStore } from '@/store/auth'
import { ROUTES } from '@/constants/routes'
import TripDetailsStep from './components/TripDetailsStep'
import RenterDetailsStep from './components/RenterDetailsStep'
import PriceBreakdownStep from './components/PriceBreakdownStep'
import PoliciesStep from './components/PoliciesStep'
import PaymentStep from './components/PaymentStep'
import ConfirmationStep from './components/ConfirmationStep'

const STEPS = [
  'Trip Details',
  'Renter Details',
  'Price Breakdown',
  'Policies',
  'Payment',
  'Confirmation'
]

export default function BookingPage() {
  const { vehicleId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)

  const [currentStep, setCurrentStep] = useState(0)
  
  // Data State
  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Booking State
  const [bookingData, setBookingData] = useState({
    startDate: searchParams.get('start') || '',
    endDate: searchParams.get('end') || '',
    location: '',
    renterDetails: {
      name: user?.name || '',
      phone: user?.phone || '',
      message: ''
    },
    agreedToPolicies: false,
    paymentMethod: 'credit_card',
    priceResult: null
  })

  // Load Vehicle
  useEffect(() => {
    async function loadVehicle() {
      try {
        setLoading(true)
        const v = await vehicleService.getById(vehicleId)
        setVehicle(v)
        setBookingData(prev => ({ ...prev, location: v.location }))
      } catch (err) {
        setError('Failed to load vehicle details.')
      } finally {
        setLoading(false)
      }
    }
    loadVehicle()
  }, [vehicleId])

  const updateBookingData = (updates) => {
    setBookingData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => setCurrentStep(prev => Math.min(STEPS.length - 1, prev + 1))
  const prevStep = () => setCurrentStep(prev => Math.max(0, prev - 1))

  if (loading) {
    return (
      <div className="min-h-[60vh] pt-24 px-6 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-[60vh] pt-24 px-6 flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-bold text-white mb-2">Oops! Something went wrong.</h2>
        <p className="text-carbon-400 mb-6">{error || 'Vehicle not found.'}</p>
        <Link to={ROUTES.VEHICLES} className="btn-primary px-6 py-2">Back to Fleet</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-white/[0.06] pb-6">
           <img src={vehicle.image} alt={vehicle.name} className="w-20 h-16 object-cover rounded-lg" />
           <div>
             <h1 className="font-display text-2xl font-bold text-white">Complete Booking</h1>
             <p className="text-carbon-400 text-sm">{vehicle.name} • {vehicle.location}</p>
           </div>
        </div>

        {/* Progress */}
        <div className="flex justify-between items-center relative px-2">
           <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-white/[0.04] -z-10" />
           <div 
             className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-neon-cyan -z-10 transition-all duration-500"
             style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
           />
           {STEPS.map((step, idx) => {
             const isActive = idx === currentStep
             const isCompleted = idx < currentStep
             return (
               <div key={idx} className="flex flex-col items-center gap-2 bg-carbon-950 px-2 relative group">
                 <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium transition-colors ${
                   isCompleted ? 'bg-neon-cyan text-carbon-950' :
                   isActive ? 'bg-carbon-900 border-2 border-neon-cyan text-neon-cyan' :
                   'bg-white/[0.04] text-carbon-500'
                 }`}>
                   {isCompleted ? '✓' : idx + 1}
                 </div>
                 {/* Tooltip for mobile / small screens, text for large */}
                 <span className="hidden md:block absolute top-8 text-[10px] uppercase tracking-wider text-carbon-400 whitespace-nowrap opacity-0 md:opacity-100">
                   {isActive || isCompleted ? <span className={isActive ? 'text-white' : 'text-carbon-400'}>{step}</span> : step}
                 </span>
               </div>
             )
           })}
        </div>

        {/* Content Container */}
        <div className="glass rounded-2xl p-6 md:p-10 min-h-[400px] mt-8">
          {currentStep === 0 && (
            <TripDetailsStep 
              vehicle={vehicle} 
              data={bookingData} 
              updateData={updateBookingData} 
              onNext={nextStep} 
            />
          )}
          {currentStep === 1 && (
            <RenterDetailsStep 
              data={bookingData} 
              updateData={updateBookingData} 
              onNext={nextStep} 
              onPrev={prevStep} 
            />
          )}
          {currentStep === 2 && (
            <PriceBreakdownStep 
              vehicle={vehicle} 
              data={bookingData} 
              updateData={updateBookingData} 
              onNext={nextStep} 
              onPrev={prevStep} 
            />
          )}
          {currentStep === 3 && (
            <PoliciesStep 
              vehicle={vehicle} 
              data={bookingData} 
              updateData={updateBookingData} 
              onNext={nextStep} 
              onPrev={prevStep} 
            />
          )}
          {currentStep === 4 && (
            <PaymentStep 
              vehicle={vehicle}
              data={bookingData} 
              updateData={updateBookingData} 
              onNext={nextStep} 
              onPrev={prevStep} 
            />
          )}
          {currentStep === 5 && (
            <ConfirmationStep 
              vehicle={vehicle}
              data={bookingData} 
            />
          )}
        </div>

      </div>
    </div>
  )
}
