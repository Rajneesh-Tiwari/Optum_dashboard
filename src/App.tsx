import { useEffect, useState } from "react"
import { usePageNavigation } from "./hooks/usePageNavigation"
import { Sidebar } from "./components/layout/Sidebar"
import { PageShell } from "./components/layout/PageShell"
import { registerTheme } from "./lib/echartsTheme"
import { LandingPage } from "./components/pages/LandingPage"
import { PopulationOverview } from "./components/pages/PopulationOverview"
import { SegmentationAnalysis } from "./components/pages/SegmentationAnalysis"
import { ChatDock } from "./components/layout/ChatDock"

function App() {
  const { page, goTo } = usePageNavigation()
  const [chatOpen, setChatOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [, setSelectedFeatureGroup] = useState("Demographics")

  useEffect(() => {
    registerTheme()
  }, [])

  const pages = [
    <LandingPage key="home" onNavigate={goTo} />,
    <PopulationOverview key="pop" onFeatureGroupChange={setSelectedFeatureGroup} onBack={() => goTo(0)} />,
    <SegmentationAnalysis key="seg" onBack={() => goTo(0)} />,
  ]

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      <Sidebar
        currentPage={page}
        onNavigate={goTo}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className="flex-1 min-h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full px-6 py-6">
          <PageShell page={page}>{pages[page]}</PageShell>
        </div>
      </main>

      <ChatDock
        open={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
        currentPage={page}
      />
    </div>
  )
}

export default App
