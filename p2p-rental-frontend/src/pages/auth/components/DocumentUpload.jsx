import { useState, useRef } from 'react'

export default function DocumentUpload({ id, label, description, onUpload, value }) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true)
    } else if (e.type === 'dragleave') {
      setIsDragging(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    // In a real app, upload to S3/CDN and return URL. Here we just fake it
    const fakeUrl = URL.createObjectURL(file)
    onUpload(fakeUrl)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">{label}</label>
      {description && <p className="text-xs text-carbon-400">{description}</p>}
      
      <div 
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          isDragging ? 'border-neon-cyan bg-neon-cyan/[0.02]' : 
          value ? 'border-green-500/30 bg-green-500/[0.02]' : 
          'border-white/[0.06] hover:border-white/20 bg-white/[0.01]'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input 
          ref={inputRef}
          type="file" 
          id={id} 
          className="hidden" 
          accept="image/*,.pdf"
          onChange={handleChange}
        />
        
        {value ? (
          <div className="flex flex-col items-center text-green-400">
             <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
             </div>
             <p className="text-sm font-medium">Document uploaded</p>
             <p className="text-xs text-carbon-500 mt-1">Click or drag to replace</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-carbon-400">
            <div className="w-12 h-12 rounded-full bg-white/[0.03] flex items-center justify-center mb-3 group-hover:bg-white/[0.06] transition-colors">
              <svg className="w-6 h-6 text-carbon-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <p className="text-sm text-white mb-1">Click to upload or drag and drop</p>
            <p className="text-xs">SVG, PNG, JPG or PDF (max. 5MB)</p>
          </div>
        )}
      </div>
    </div>
  )
}
