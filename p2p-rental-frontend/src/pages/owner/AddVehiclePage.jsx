import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

const WIZARD_STEPS = [
  'Basic Details',
  'Specifications',
  'Images',
  'Documents',
  'Pricing',
  'Availability',
  'Review'
]

export default function AddVehiclePage() {
  const [currentStep, setCurrentStep] = useState(0)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      
      <div>
        <h1 className="font-display text-3xl font-bold text-white tracking-tight">List New Vehicle</h1>
        <p className="text-carbon-400 mt-1">Complete the details below to add a new vehicle to your fleet.</p>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        
        {/* Wizard Header (Progress) */}
        <div className="flex overflow-x-auto border-b border-white/[0.06] hide-scrollbar bg-white/[0.01]">
          {WIZARD_STEPS.map((step, index) => {
            const isActive = index === currentStep
            const isCompleted = index < currentStep
            return (
              <div 
                key={index}
                className={`flex-shrink-0 px-6 py-4 flex items-center gap-3 border-b-2 transition-colors ${
                  isActive ? 'border-neon-cyan' : 'border-transparent'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  isCompleted ? 'bg-neon-cyan text-carbon-950' : 
                  isActive ? 'bg-carbon-900 border border-neon-cyan text-neon-cyan' : 
                  'bg-white/[0.03] text-carbon-500'
                }`}>
                  {isCompleted ? '✓' : index + 1}
                </div>
                <span className={`text-sm font-medium whitespace-nowrap ${
                  isActive ? 'text-white' : 'text-carbon-500'
                }`}>
                  {step}
                </span>
              </div>
            )
          })}
        </div>

        {/* Wizard Content (Mock steps for brevity) */}
        <div className="p-8 min-h-[400px]">
          
          {currentStep === 0 && (
             <div className="space-y-5">
               <h2 className="text-xl font-medium text-white mb-6">Basic Details</h2>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-carbon-300 mb-1.5">Make</label>
                   <input type="text" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2 text-white" placeholder="e.g. Tesla" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-carbon-300 mb-1.5">Model</label>
                   <input type="text" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2 text-white" placeholder="e.g. Model S" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-carbon-300 mb-1.5">Year</label>
                   <input type="number" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2 text-white" placeholder="2025" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-carbon-300 mb-1.5">License Plate</label>
                   <input type="text" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2 text-white" placeholder="ABC 123" />
                 </div>
               </div>
             </div>
          )}

          {currentStep === 1 && (
             <div className="space-y-5">
               <h2 className="text-xl font-medium text-white mb-6">Specifications</h2>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-carbon-300 mb-1.5">Vehicle Type</label>
                   <select className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2 text-white">
                     <option>SUV</option><option>Sedan</option><option>Electric</option><option>Sports</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-carbon-300 mb-1.5">Transmission</label>
                   <select className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2 text-white">
                     <option>Automatic</option><option>Manual</option>
                   </select>
                 </div>
               </div>
             </div>
          )}

          {currentStep >= 2 && currentStep <= 5 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
               <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-4">
                 <svg className="w-8 h-8 text-carbon-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
               </div>
               <h3 className="text-lg font-medium text-white mb-2">{WIZARD_STEPS[currentStep]} Configuration</h3>
               <p className="text-carbon-400 text-sm max-w-sm">This section would contain the complex forms for uploading documents, setting dynamic pricing, and managing calendar availability.</p>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-white mb-2">Review & Submit</h2>
              <p className="text-carbon-400 text-sm mb-6">Please review your listing. Once submitted, our team will review the vehicle documents before it goes live.</p>
              
              <div className="p-6 bg-white/[0.02] border border-white/[0.04] rounded-xl flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <div>
                   <div className="text-sm font-medium text-white">All required fields completed</div>
                   <div className="text-xs text-carbon-400">Your listing is ready for review.</div>
                 </div>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Footer */}
        <div className="p-6 border-t border-white/[0.06] bg-carbon-950/50 flex justify-between">
          <button 
            className="btn-secondary px-6 py-2"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(prev => prev - 1)}
          >
            Back
          </button>
          
          {currentStep < WIZARD_STEPS.length - 1 ? (
            <button 
              className="btn-primary px-6 py-2"
              onClick={() => setCurrentStep(prev => prev + 1)}
            >
              Continue
            </button>
          ) : (
            <Link to={ROUTES.OWNER_VEHICLES} className="btn-primary px-6 py-2">
              Submit for Verification
            </Link>
          )}
        </div>

      </div>
    </div>
  )
}
