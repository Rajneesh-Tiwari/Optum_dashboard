interface KPICardProps {
  label: string
  value: string
  subtitle?: string
  icon?: string
}

export function KPICard({ label, value, subtitle }: KPICardProps) {
  return (
    <div className="glass-card p-5 flex flex-col">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</div>
      <div className="text-2xl font-bold text-gray-900 leading-tight">{value}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-1.5">{subtitle}</div>}
    </div>
  )
}
