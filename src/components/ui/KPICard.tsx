interface KPICardProps {
  label: string
  value: string
  subtitle?: string
  icon?: string
}

export function KPICard({ label, value, subtitle }: KPICardProps) {
  return (
    <div className="glass-card p-5">
      <div className="text-sm text-slate-400 mb-1">{label}</div>
      <div className="text-2xl font-bold text-slate-100">{value}</div>
      {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
    </div>
  )
}
