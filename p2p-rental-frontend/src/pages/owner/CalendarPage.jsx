export default function CalendarPage() {
  const days = Array.from({ length: 30 }, (_, i) => i + 1)
  
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="font-display text-3xl font-bold text-white tracking-tight">Availability Calendar</h1>
        <p className="text-carbon-400 mt-1">Manage when your vehicles are available for rent.</p>
      </div>

      <div className="glass rounded-2xl p-6 overflow-x-auto">
        
        {/* Legend */}
        <div className="flex items-center gap-6 mb-8 text-sm">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-carbon-800" /> Available</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-red-500/20 border border-red-500/30" /> Blocked</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-yellow-500/20 border border-yellow-500/30" /> Pending Booking</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-neon-cyan/20 border border-neon-cyan/30" /> Confirmed Booking</div>
        </div>

        {/* Mock Calendar Grid */}
        <div className="min-w-[800px]">
           {/* Header */}
           <div className="flex border-b border-white/[0.06] pb-2 mb-2">
             <div className="w-48 flex-shrink-0 text-carbon-400 text-sm font-medium">Vehicle</div>
             <div className="flex-1 flex">
               {days.map(d => (
                 <div key={d} className="flex-1 text-center text-xs text-carbon-500">{d}</div>
               ))}
             </div>
           </div>

           {/* Row 1 */}
           <div className="flex items-center border-b border-white/[0.04] py-3 hover:bg-white/[0.02]">
             <div className="w-48 flex-shrink-0 text-white text-sm">Tesla Model S Plaid</div>
             <div className="flex-1 flex gap-1 h-8">
               {days.map(d => {
                 let bg = 'bg-carbon-800'
                 if (d >= 5 && d <= 7) bg = 'bg-neon-cyan/20 border border-neon-cyan/30'
                 if (d >= 12 && d <= 14) bg = 'bg-red-500/20 border border-red-500/30'
                 return <div key={d} className={`flex-1 rounded-sm ${bg}`} />
               })}
             </div>
           </div>

           {/* Row 2 */}
           <div className="flex items-center border-b border-white/[0.04] py-3 hover:bg-white/[0.02]">
             <div className="w-48 flex-shrink-0 text-white text-sm">Porsche 911 GT3</div>
             <div className="flex-1 flex gap-1 h-8">
               {days.map(d => {
                 let bg = 'bg-carbon-800'
                 if (d >= 15 && d <= 18) bg = 'bg-yellow-500/20 border border-yellow-500/30'
                 if (d >= 20 && d <= 25) bg = 'bg-neon-cyan/20 border border-neon-cyan/30'
                 return <div key={d} className={`flex-1 rounded-sm ${bg}`} />
               })}
             </div>
           </div>
        </div>

      </div>
    </div>
  )
}
