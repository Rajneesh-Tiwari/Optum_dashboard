interface ClusterCardProps {
  id: number
  name: string
  color: string
  count: number
  avgCost: string
  avgAge: string
  selected?: boolean
  onClick?: () => void
}

export function ClusterCard({
  id,
  name,
  color,
  count,
  avgCost,
  avgAge,
  selected,
  onClick,
}: ClusterCardProps) {
  return (
    <button
      onClick={onClick}
      className={`glass-card p-4 text-left transition-all cursor-pointer w-full ${
        selected ? "ring-2" : "hover:border-gray-300"
      }`}
      style={selected ? { borderColor: color, boxShadow: `0 0 12px ${color}33` } : {}}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-medium text-gray-500">Cluster {id}</span>
      </div>
      <div className="text-sm font-semibold text-gray-900 mb-2">{name}</div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <div className="text-gray-500">Members</div>
          <div className="font-medium text-gray-800">{count}</div>
        </div>
        <div>
          <div className="text-gray-500">Avg Cost</div>
          <div className="font-medium text-gray-800">{avgCost}</div>
        </div>
        <div>
          <div className="text-gray-500">Avg Age</div>
          <div className="font-medium text-gray-800">{avgAge}</div>
        </div>
      </div>
    </button>
  )
}
