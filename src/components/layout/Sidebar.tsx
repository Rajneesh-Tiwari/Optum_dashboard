import { PAGE_LABELS } from "../../hooks/usePageNavigation"
import { HWHIIcon } from "../HWHIIcon"

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
  // Intervention Planner
  <svg key="intervention" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M8 6h8M8 10h8M8 14h4" />
    <circle cx="16" cy="18" r="2" />
    <path d="M14 18h-6" />
  </svg>,
]

function BrandLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="px-4 py-5 border-b border-gray-200 flex items-center gap-3">
      <HWHIIcon size={32} className="shrink-0" />
      {!collapsed && (
        <div className="overflow-hidden">
          <div className="text-sm font-bold text-gray-900 leading-tight tracking-tight">
            Heartland <span className="text-optum">Whole Health</span>
          </div>
          <div className="text-[10px] text-gray-400 leading-tight">Cardiometabolic Intelligence</div>
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
      <BrandLogo collapsed={collapsed} />

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

      {/* Settings */}
      <div className="px-2 pb-1">
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all cursor-pointer"
          title="Settings"
        >
          <span className="shrink-0 text-gray-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </span>
          {!collapsed && <span className="truncate">Settings</span>}
        </button>
      </div>

      {/* User profile */}
      <div className="px-3 py-3 border-t border-gray-200">
        <div className="flex items-center gap-3 px-1">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #799842, #5F7A33)' }}>
              DH
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-gray-900 leading-tight truncate">Daniel H.</div>
              <div className="text-[10px] text-gray-400 leading-tight">Health Analyst</div>
            </div>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <div className="px-2 py-2 border-t border-gray-100">
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
