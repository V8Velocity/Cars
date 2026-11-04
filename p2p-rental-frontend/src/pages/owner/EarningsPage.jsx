export default function EarningsPage() {
  const stats = [
    { label: 'Gross Earnings', value: '$8,450.00', color: 'text-white' },
    { label: 'Platform Fees (10%)', value: '-$845.00', color: 'text-red-400' },
    { label: 'Refunds', value: '$0.00', color: 'text-carbon-400' },
    { label: 'Net Earnings', value: '$7,605.00', color: 'text-neon-cyan' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="font-display text-3xl font-bold text-white tracking-tight">Earnings & Payouts</h1>
        <p className="text-carbon-400 mt-1">Track your income and manage payout methods.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass rounded-2xl p-6">
            <div className="text-sm text-carbon-400 uppercase tracking-wider mb-2">{stat.label}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Payout Status */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
           <h2 className="text-lg font-medium text-white mb-6">Recent Transactions</h2>
           
           <div className="space-y-4">
             {/* Pending Payout */}
             <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <div>
                   <div className="text-white font-medium">Pending Payout</div>
                   <div className="text-xs text-carbon-400">Processing • Est. arrival Oct 15</div>
                 </div>
               </div>
               <div className="text-right">
                 <div className="text-white font-bold">$1,250.00</div>
                 <div className="text-[10px] uppercase text-yellow-500 mt-1">Pending</div>
               </div>
             </div>

             {/* Completed Payout */}
             <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                 </div>
                 <div>
                   <div className="text-white font-medium">Completed Payout</div>
                   <div className="text-xs text-carbon-400">Bank transfer ending in 4321 • Sep 30</div>
                 </div>
               </div>
               <div className="text-right">
                 <div className="text-white font-bold">$3,105.00</div>
                 <div className="text-[10px] uppercase text-green-500 mt-1">Completed</div>
               </div>
             </div>
           </div>
        </div>

        {/* Payout Method */}
        <div className="glass rounded-2xl p-6 h-fit">
          <h2 className="text-lg font-medium text-white mb-6">Payout Method</h2>
          
          <div className="p-4 border border-neon-cyan/30 bg-neon-cyan/[0.02] rounded-xl flex items-start gap-3 mb-6">
            <svg className="w-6 h-6 text-neon-cyan flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <div>
              <div className="text-sm text-white font-medium">Bank Account</div>
              <div className="text-xs text-carbon-400 mt-1">Chase Bank •••• 4321</div>
            </div>
          </div>

          <button className="btn-secondary w-full py-2.5 text-sm">Update Payout Method</button>
        </div>

      </div>
    </div>
  )
}
