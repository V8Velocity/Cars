const STATUS_STYLES = {
  Pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  Confirmed: 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20',
  Handover: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Active: 'bg-green-500/10 text-green-500 border-green-500/20',
  Returned: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Completed: 'bg-carbon-700 text-carbon-300 border-carbon-600',
  Cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
}

export default function BookingStatusBadge({ status, className = '' }) {
  const styles = STATUS_STYLES[status] || STATUS_STYLES.Completed
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border ${styles} ${className}`}>
      {status}
    </span>
  )
}
