import { useEffect, useState } from "react"
import { usePageNavigation } from "./hooks/usePageNavigation"
import { Stepper } from "./components/layout/Stepper"
import { PageShell } from "./components/layout/PageShell"
import { registerTheme } from "./lib/echartsTheme"
import { PopulationOverview } from "./components/pages/PopulationOverview"
import { AISegmentation } from "./components/pages/AISegmentation"
import { ClusterDeepDive } from "./components/pages/ClusterDeepDive"
import { ChatDock } from "./components/layout/ChatDock"

function App() {
  const { page, next, prev, goTo, totalPages } = usePageNavigation()
  const [chatOpen, setChatOpen] = useState(false)
  const [activeCluster, setActiveCluster] = useState(1)
  const [highlightCluster, setHighlightCluster] = useState<number | null>(null)
  const [, setSelectedFeatureGroup] = useState("Demographics")

  useEffect(() => {
    registerTheme()
  }, [])

  const pages = [
    <PopulationOverview
      key="p1"
      onFeatureGroupChange={setSelectedFeatureGroup}
    />,
    <AISegmentation
      key="p2"
      highlightCluster={highlightCluster}
      onHighlightCluster={setHighlightCluster}
    />,
    <ClusterDeepDive
      key="p3"
      activeCluster={activeCluster}
      onClusterChange={setActiveCluster}
    />,
  ]

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-optum flex items-center justify-center text-white font-bold text-sm">
              O
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-100">
                Cardio-Metabolic Population Health
              </h1>
              <p className="text-xs text-slate-400">Arkansas - 500 Members - AI Segmentation Demo</p>
            </div>
          </div>
          <Stepper currentPage={page} onGoTo={goTo} />
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <PageShell page={page}>{pages[page]}</PageShell>
      </main>

      {/* Bottom navigation */}
      <footer className="border-t border-slate-800 bg-slate-900/80 backdrop-blur sticky bottom-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={prev}
            disabled={page === 0}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              page === 0
                ? "opacity-0 pointer-events-none"
                : "bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-500 cursor-pointer"
            }`}
          >
            Previous
          </button>
          <span className="text-xs text-slate-500">
            {page + 1} of {totalPages}
          </span>
          <button
            onClick={page === totalPages - 1 ? () => goTo(0) : next}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-optum text-white hover:bg-optum-dark transition-all cursor-pointer"
          >
            {page === totalPages - 1 ? "Restart" : "Next"}
          </button>
        </div>
      </footer>

      {/* Chat dock */}
      <ChatDock
        open={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
        currentPage={page}
        activeCluster={activeCluster}
      />
    </div>
  )
}

export default App
