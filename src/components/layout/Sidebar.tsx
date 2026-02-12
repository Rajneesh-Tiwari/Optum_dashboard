import { PAGE_LABELS } from "../../hooks/usePageNavigation"

interface SidebarProps {
  currentPage: number
  onNavigate: (page: number) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

const NAV_ICONS = [
  // Home
  <svg key="home" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>,
  // Population
  <svg key="pop" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>,
  // Segmentation
  <svg key="seg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0 1 0 20" />
    <path d="M2 12h20" />
    <path d="M12 2c2.5 3.5 4 7.5 4 10s-1.5 6.5-4 10" />
  </svg>,
]

function OptumLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="px-4 py-5 border-b border-gray-200 flex items-center gap-3">
      <svg width="32" height="32" viewBox="0 0 32 32" className="shrink-0">
        <circle cx="16" cy="16" r="14" fill="#FF612B" />
        <circle cx="16" cy="16" r="6" fill="white" opacity="0.9" />
        <circle cx="16" cy="16" r="2.5" fill="#FF612B" />
      </svg>
      {!collapsed && (
        <div className="overflow-hidden">
          <div className="text-sm font-bold text-gray-900 leading-tight tracking-tight">
            <span className="text-optum">Optum</span> Value Connect
          </div>
          <div className="text-[10px] text-gray-400 leading-tight">Population Health</div>
        </div>
      )}
    </div>
  )
}

export function Sidebar({ currentPage, onNavigate, collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <aside
      className={`h-screen sticky top-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shrink-0 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <OptumLogo collapsed={collapsed} />

      <nav className="flex-1 py-4 px-2 space-y-1">
        {PAGE_LABELS.map((label, i) => {
          const isActive = currentPage === i
          return (
            <button
              key={i}
              onClick={() => onNavigate(i)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-optum/8 text-optum border-l-2 border-optum"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
              title={label}
            >
              <span className={`shrink-0 ${isActive ? "text-optum" : "text-gray-400"}`}>
                {NAV_ICONS[i]}
              </span>
              {!collapsed && <span className="truncate">{label}</span>}
            </button>
          )
        })}
      </nav>

      <div className="px-2 py-3 border-t border-gray-200">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
