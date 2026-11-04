const STATUS_STYLES = {
  PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  APPROVED: 'bg-green-500/10 text-green-500 border-green-500/20',
  REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
  EXPIRED: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  UNVERIFIED: 'bg-carbon-800 text-carbon-400 border-carbon-700'
}

export default function KYCStatusBadge({ status = 'UNVERIFIED', className = '' }) {
  const styles = STATUS_STYLES[status] || STATUS_STYLES.UNVERIFIED
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border ${styles} ${className}`}>
      {status}
    </span>
  )
}
