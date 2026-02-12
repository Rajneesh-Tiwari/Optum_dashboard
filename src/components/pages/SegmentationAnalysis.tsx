import { useState } from "react"
import { PersonaCard } from "../ui/PersonaCard"
import { ClusterScatter } from "../charts/ClusterScatter"
import { ClusterRadar } from "../charts/ClusterRadar"
import { SankeyChart } from "../charts/SankeyChart"
import { clusterPersonas } from "../../data/clusterPersonas"
import {
  clusterStats,
  CLUSTER_COLORS,
  getClusterCompositionSankey,
  getRiskFactorFlowSankey,
} from "../../lib/dataUtils"
import {
  formatDecimal,
  formatPercent,
  formatCurrency,
} from "../../lib/format"

const CLUSTER_TAKEAWAYS: Record<number, string> = {
  1: "Segment 1 (At-Risk Baseline) is the youngest, lowest-cost group. These members are in the early stages of hypertension with standard PCP adherence. The intervention window is 12-18 months before disease trajectory accelerates. Lifestyle modification programs at $600-1,200/year per member could prevent 3-8x cost escalation.",
  2: "Segment 2 (Unmanaged Metabolic Syndrome) sits at a critical inflection point. 100% carry dual diabetes + hypertension. Without intensive management, 15-20% will experience cardiac events within 2 years. Pharmacy optimization and endocrinology coordination are highest-leverage interventions.",
  3: "Segment 3 (Advanced Heart Failure) drives disproportionate acute-care spend. A 35% 30-day readmission rate is 3x the national average. Remote monitoring and care transition programs offer the fastest ROI - break-even within 4-6 months.",
  4: "Segment 4 (Diabetic Nephropathy/ESRD) contains the most expensive individual members. ESRD management averages $90K+/year per member. Pre-ESRD diversion for the 20% not yet on dialysis saves $45K+ per diverted member. Home dialysis conversion saves 30-40% vs. in-center.",
  5: "Segment 5 (Rural SDOH Crisis) is uniquely defined by zero PCP engagement and extreme geographic isolation. This is fundamentally an access problem - clinical programs will fail without first solving transportation, broadband, and community health worker deployment.",
  6: "Segment 6 (Frail Elderly Complex) has the highest comorbidity burden (CCI 4-9) and frailty index. Quality-of-life-focused interventions - polypharmacy review, advance care planning, home-based primary care - outperform aggressive disease management.",
}

const DEFAULT_TAKEAWAY = "Six distinct member archetypes emerge from the data, each with a unique cost profile, utilization pattern, and intervention opportunity. Select a segment above to see a detailed breakdown."

// Short labels for the pill selector
const SHORT_LABELS: Record<number, string> = {
  1: "At-Risk",
  2: "Metabolic",
  3: "Heart Failure",
  4: "ESRD",
  5: "Rural SDOH",
  6: "Frail Elderly",
}

interface SegmentationAnalysisProps {
  onBack?: () => void
}

export function SegmentationAnalysis({ onBack }: SegmentationAnalysisProps) {
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null)
  const clusters = [1, 2, 3, 4, 5, 6]

  const handleClusterClick = (c: number) => {
    setSelectedCluster(selectedCluster === c ? null : c)
  }

  const stats = selectedCluster ? clusterStats(selectedCluster) : null
  const persona = selectedCluster ? clusterPersonas.find((p) => p.id === selectedCluster) : null
  const takeaway = selectedCluster ? CLUSTER_TAKEAWAYS[selectedCluster] : DEFAULT_TAKEAWAY

  // Sankey data
  const compositionSankey = getClusterCompositionSankey(selectedCluster ?? undefined)
  const riskFlowSankey = getRiskFactorFlowSankey(selectedCluster ?? undefined)

  return (
    <div className="space-y-6">
      {/* Page header with back button */}
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95" style={{ background: 'linear-gradient(145deg, #e8f0fe, #dbeafe)', border: '1.5px solid rgba(96, 165, 250, 0.35)', boxShadow: '0 2px 8px rgba(96, 165, 250, 0.18), 0 1px 2px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.7)' }} title="Back to Home">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <svg width="28" height="28" viewBox="0 0 32 32" className="shrink-0">
          <circle cx="16" cy="16" r="14" fill="#FF612B" />
          <circle cx="16" cy="16" r="6" fill="white" opacity="0.9" />
          <circle cx="16" cy="16" r="2.5" fill="#FF612B" />
        </svg>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Segmentation Analysis</h2>
          <p className="text-sm text-gray-500">6 AI-identified member segments</p>
        </div>
      </div>

      {/* Segment selector */}
      <div className="grid grid-cols-6 gap-3">
        {clusters.map((c) => {
          const isSelected = selectedCluster === c
          const s = clusterStats(c)
          const color = CLUSTER_COLORS[c]
          return (
            <button
              key={c}
              onClick={() => handleClusterClick(c)}
              className={`segment-pill glass-card p-3.5 cursor-pointer text-left relative overflow-hidden ${
                isSelected ? "active" : ""
              }`}
              style={isSelected ? {
                borderColor: color,
                boxShadow: `0 0 0 1px ${color}40, 0 4px 12px ${color}15`,
              } : {}}
            >
              {/* Color accent bar at top */}
              <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-xl transition-opacity"
                style={{ backgroundColor: color, opacity: isSelected ? 1 : 0.3 }}
              />
              <div className="flex items-center gap-2 mb-2 mt-0.5">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[10px] font-medium text-gray-400">S{c}</span>
              </div>
              <div className={`text-xs font-semibold mb-1 ${isSelected ? "text-gray-900" : "text-gray-700"}`}>
                {SHORT_LABELS[c]}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400">{s.count} members</span>
                <span className="text-[10px] text-gray-400">{formatCurrency(s.avgCost)}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Flow charts - upfront */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <SankeyChart
            title="Member Demographics Flow"
            nodes={compositionSankey.nodes}
            links={compositionSankey.links}
            height={420}
          />
        </div>
        <div className="glass-card p-4">
          <SankeyChart
            title="Risk to Cost Pathway"
            nodes={riskFlowSankey.nodes}
            links={riskFlowSankey.links}
            height={420}
          />
        </div>
      </div>

      {/* Population map + Radar */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">
            Population Map
          </h3>
          <ClusterScatter highlightCluster={selectedCluster} />
        </div>
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">
            Segment Comparison
          </h3>
          <ClusterRadar highlightCluster={selectedCluster} />
        </div>
      </div>

      {/* Cluster detail section - shown when a cluster is selected */}
      {selectedCluster && stats && persona && (
        <>
          {/* Stat grid */}
          <div className="grid grid-cols-9 gap-3">
            <StatBox label="Members" value={String(stats.count)} />
            <StatBox label="Avg Age" value={formatDecimal(stats.avgAge, 1)} />
            <StatBox label="Avg Cost" value={formatCurrency(stats.avgCost)} />
            <StatBox label="Severity" value={formatDecimal(stats.avgSeverity, 2)} />
            <StatBox label="Diabetes" value={formatPercent(stats.pctDiabetes, 0)} />
            <StatBox label="Heart Dz" value={formatPercent(stats.pctHeart, 0)} />
            <StatBox label="ESRD" value={formatPercent(stats.pctESRD, 0)} />
            <StatBox label="Avg ER" value={formatDecimal(stats.avgER, 1)} />
            <StatBox label="Risk Score" value={formatDecimal(stats.avgRiskScore, 3)} />
          </div>

          {/* Persona */}
          <PersonaCard key={selectedCluster} persona={persona} animate={true} />
        </>
      )}

      {/* Takeaway */}
      <div className="glass-card p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
          </svg>
        </div>
        <div>
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Insight</div>
          <p className="text-sm text-gray-600 leading-relaxed">{takeaway}</p>
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card p-3 text-center">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</div>
      <div className="text-sm font-bold text-gray-900 mt-1">{value}</div>
    </div>
  )
}
