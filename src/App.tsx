import { useEffect, useState } from "react"
import { usePageNavigation } from "./hooks/usePageNavigation"
import { Sidebar } from "./components/layout/Sidebar"
import { PageShell } from "./components/layout/PageShell"
import { registerTheme } from "./lib/echartsTheme"
import { LandingPage } from "./components/pages/LandingPage"
import { PopulationOverview } from "./components/pages/PopulationOverview"
import { SegmentationAnalysis } from "./components/pages/SegmentationAnalysis"
import { InterventionPlanner } from "./components/pages/InterventionPlanner"
import { ChatDock } from "./components/layout/ChatDock"
import { HWHIIcon } from "./components/HWHIIcon"

function App() {
  const { page, goTo } = usePageNavigation()
  const [chatOpen, setChatOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [, setSelectedFeatureGroup] = useState("Demographics")
  const [pendingQuery, setPendingQuery] = useState<string | undefined>()

  useEffect(() => {
    registerTheme()
  }, [])

  const handleLandingChatSubmit = (query: string) => {
    setPendingQuery(query)
    setChatOpen(true)
  }

  const pages = [
    <LandingPage key="home" onNavigate={goTo} onChatSubmit={handleLandingChatSubmit} />,
    <PopulationOverview key="pop" onFeatureGroupChange={setSelectedFeatureGroup} onBack={() => goTo(0)} onNavigateToSegments={() => goTo(2)} />,
    <SegmentationAnalysis key="seg" onBack={() => goTo(0)} onNavigateToIntervention={() => goTo(3)} />,
    <InterventionPlanner key="intervention" onBack={() => goTo(0)} />,
  ]

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      <Sidebar
        currentPage={page}
        onNavigate={goTo}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className="flex-1 min-h-screen overflow-y-auto flex flex-col">
        <div className="max-w-7xl mx-auto w-full px-6 py-6 flex-1">
          <PageShell page={page}>{pages[page]}</PageShell>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HWHIIcon size={20} className="shrink-0" />
              <span className="text-xs font-semibold text-gray-500 tracking-wide">Heartland Whole Health Institute</span>
              <span className="text-gray-300">|</span>
              <span className="text-xs text-gray-400">Cardiometabolic Intelligence</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-gray-400">
              <span>Internal Use Only</span>
            </div>
          </div>
        </footer>
      </main>

      <ChatDock
        open={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
        currentPage={page}
        pendingQuery={pendingQuery}
        onPendingQueryConsumed={() => setPendingQuery(undefined)}
      />
    </div>
  )
}

export default App
