interface KPICardProps {
  label: string
  value: string
  subtitle?: string
  trend?: { value: string; positive: boolean }
}

export function KPICard({ label, value, subtitle, trend }: KPICardProps) {
  return (
    <div className="glass-card p-5 flex flex-col">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</div>
      <div className="flex items-end gap-2">
        <div className="text-2xl font-bold text-gray-900 leading-tight">{value}</div>
        {trend && (
          <span className={`text-xs font-semibold flex items-center gap-0.5 mb-0.5 ${trend.positive ? "text-emerald-500" : "text-rose-400"}`}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              {trend.positive
                ? <polyline points="18 15 12 9 6 15" />
                : <polyline points="6 9 12 15 18 9" />
              }
            </svg>
            {trend.value}
          </span>
        )}
      </div>
      {subtitle && <div className="text-xs text-gray-400 mt-1.5">{subtitle}</div>}
    </div>
  )
}
