import React, { useState } from "react"
import { ClusterScatter } from "../charts/ClusterScatter"
import { ClusterRadar } from "../charts/ClusterRadar"
import { SankeyChart } from "../charts/SankeyChart"
import { HWHIIcon } from "../HWHIIcon"
import { clusterPersonas } from "../../data/clusterPersonas"
import {
  clusterStats,
  CLUSTER_COLORS,
  getClusterCompositionSankey,
  getRiskFactorFlowSankey,
  getNodeMemberStats,
  type NodeStats,
} from "../../lib/dataUtils"
import {
  formatDecimal,
  formatPercent,
  formatCurrency,
} from "../../lib/format"

const CLUSTER_TAKEAWAYS: Record<number, string> = {
  1: "Lifestyle modification programs at $600-1,200/yr per member could prevent 3-8x cost escalation. Intervention window: 12-18 months.",
  2: "Pharmacy optimization and endocrinology coordination are highest-leverage. Without intervention, 15-20% cardiac events within 2 years.",
  3: "Remote monitoring and care transition programs offer fastest ROI - break-even within 4-6 months. 35% readmission rate is 3x national avg.",
  4: "Pre-ESRD diversion for the 20% not yet on dialysis saves $45K+ per member. Home dialysis conversion saves 30-40% vs. in-center.",
  5: "Clinical programs will fail without first solving access: transportation, broadband, community health worker deployment.",
  6: "Quality-of-life interventions - polypharmacy review, advance care planning, home-based primary care - outperform aggressive disease management.",
}

const DEFAULT_TAKEAWAY = "Six distinct member segments, each with a unique cost profile and intervention opportunity. Select a segment to see the recommended strategy."

// Hardcoded "LLM-style" findings per segment, reactive to selection
const SEGMENT_FINDINGS: Record<number, Array<React.ReactNode>> = {
  1: [
    <><span className="font-semibold text-rose-600">Avg risk 0.28</span> but trending upward. Without intervention, <span className="font-semibold text-rose-600">15-20%</span> will escalate within 12 months.</>,
    <>Lowest cost segment at <span className="font-semibold text-emerald-600">$18K/yr</span>. Lifestyle programs at $600-1,200/member could prevent <span className="font-semibold text-rose-600">3-8x cost escalation</span>.</>,
    <><span className="font-semibold text-emerald-600">Highest intervention ROI</span>: preventive engagement here avoids downstream spend in Metabolic and HF segments.</>,
  ],
  2: [
    <><span className="font-semibold text-rose-600">85% diabetes</span> and <span className="font-semibold text-rose-600">78% hypertension</span> co-occurrence. Compounding metabolic risk drives cost.</>,
    <>Pharmacy optimization could reduce spend by <span className="font-semibold text-emerald-600">12-18%</span>. Endocrinology coordination is highest-leverage.</>,
    <>Without intervention: <span className="font-semibold text-rose-600">15-20% cardiac event probability</span> within 2 years.</>,
  ],
  3: [
    <><span className="font-semibold text-rose-600">35% readmission rate</span> - 3x national average. Care transition gaps are the primary driver.</>,
    <>Remote monitoring programs show <span className="font-semibold text-emerald-600">break-even within 4-6 months</span> for this segment.</>,
    <>Avg cost <span className="font-semibold text-rose-600">$143K/yr</span>. Highest acute utilization of any segment.</>,
  ],
  4: [
    <><span className="font-semibold text-rose-600">Highest cost segment</span> at $185K+/yr. ESRD management dominates total spend.</>,
    <>20% not yet on dialysis: pre-ESRD diversion saves <span className="font-semibold text-emerald-600">$45K+ per member</span>.</>,
    <>Home dialysis conversion saves <span className="font-semibold text-emerald-600">30-40%</span> vs. in-center. Adoption currently below 15%.</>,
  ],
  5: [
    <><span className="font-semibold text-rose-600">3-4x distance</span> to urgent care. <span className="font-semibold text-rose-600">3x internet exclusion</span> rate vs. urban members.</>,
    <>Clinical programs <span className="font-semibold text-rose-600">will fail</span> without solving access first: transportation, broadband, CHW deployment.</>,
    <>Food desert exposure correlates with <span className="font-semibold text-rose-600">higher ER utilization</span>. Telehealth alone is insufficient.</>,
  ],
  6: [
    <>Avg age <span className="font-semibold text-rose-600">82+</span> with frailty index <span className="font-semibold text-rose-600">0.35+</span>. Polypharmacy review is top priority.</>,
    <>Quality-of-life interventions <span className="font-semibold text-emerald-600">outperform</span> aggressive disease management for this cohort.</>,
    <>Advance care planning and home-based primary care reduce <span className="font-semibold text-emerald-600">unnecessary hospitalizations by 25-40%</span>.</>,
  ],
}

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
  onNavigateToIntervention?: () => void
}

type SortKey = "default" | "cost" | "risk" | "size"

export function SegmentationAnalysis({ onBack, onNavigateToIntervention }: SegmentationAnalysisProps) {
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null)
  const [personaOpen, setPersonaOpen] = useState(true)
  const [sortBy, setSortBy] = useState<SortKey>("default")
  const [sankeyNode, setSankeyNode] = useState<NodeStats | null>(null)

  const allClusters = [1, 2, 3, 4, 5, 6]
  const clusters = [...allClusters].sort((a, b) => {
    if (sortBy === "default") return a - b
    const sa = clusterStats(a)
    const sb = clusterStats(b)
    if (sortBy === "cost") return sb.avgCost - sa.avgCost
    if (sortBy === "risk") return sb.avgRiskScore - sa.avgRiskScore
    return sb.count - sa.count // size
  })

  const handleClusterClick = (c: number) => {
    setSelectedCluster(selectedCluster === c ? null : c)
    setPersonaOpen(true)
    setSankeyNode(null) // close sankey pane when segment is toggled
  }

  const stats = selectedCluster ? clusterStats(selectedCluster) : null
  const persona = selectedCluster ? clusterPersonas.find((p) => p.id === selectedCluster) : null
  const takeaway = selectedCluster ? CLUSTER_TAKEAWAYS[selectedCluster] : DEFAULT_TAKEAWAY
  const color = selectedCluster ? CLUSTER_COLORS[selectedCluster] : undefined

  // Sankey data
  const compositionSankey = getClusterCompositionSankey(selectedCluster ?? undefined)
  const riskFlowSankey = getRiskFactorFlowSankey(selectedCluster ?? undefined)

  // Computed segment findings
  const allStats = allClusters.map(c => ({ id: c, label: SHORT_LABELS[c], ...clusterStats(c) }))
  const highCostSegs = allStats.filter(s => s.avgCost > 100000)
  const highCostMembers = highCostSegs.reduce((sum, s) => sum + s.count, 0)
  const lowCostSeg = allStats.reduce((a, b) => a.avgCost < b.avgCost ? a : b)
  const highCostLabel = highCostSegs.map(s => s.label).join(" and ")

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95" style={{ background: 'linear-gradient(145deg, #EFF5E6, #E4EDDA)', border: '1.5px solid rgba(121, 152, 66, 0.35)', boxShadow: '0 2px 8px rgba(121, 152, 66, 0.18), 0 1px 2px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.7)' }} title="Back to Home">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#799842" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <HWHIIcon size={28} className="shrink-0" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Segment Studio</h2>
            <p className="text-sm text-gray-500">Select a segment to see details and recommended actions</p>
          </div>
        </div>

        {/* Export */}
        <button className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-500 text-xs rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50 hover:text-gray-700 transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Export
        </button>
      </div>

      {/* Segment selector */}
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Segments</div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-400">Sort by</span>
          {(["default", "cost", "risk", "size"] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`px-2 py-1 text-[10px] font-medium rounded-md cursor-pointer transition-colors ${
                sortBy === key
                  ? "bg-gray-100 text-gray-700"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {key === "default" ? "Default" : key === "cost" ? "Cost" : key === "risk" ? "Risk" : "Size"}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-6 gap-3">
        {clusters.map((c) => {
          const isSelected = selectedCluster === c
          const s = clusterStats(c)
          const clr = CLUSTER_COLORS[c]
          return (
            <button
              key={c}
              onClick={() => handleClusterClick(c)}
              className={`segment-pill glass-card p-3.5 cursor-pointer text-left relative overflow-hidden ${
                isSelected ? "active" : ""
              }`}
              style={isSelected ? {
                borderColor: clr,
                boxShadow: `0 0 0 1px ${clr}40, 0 4px 12px ${clr}15`,
              } : {}}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-xl transition-opacity"
                style={{ backgroundColor: clr, opacity: isSelected ? 1 : 0.3 }}
              />
              <div className="flex items-center gap-2 mb-2 mt-0.5">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: clr }}
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

      {/* Main content + Right panel */}
      <div className="flex gap-5">
        {/* Left: charts */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Sankeys + detail pane */}
          <div className={`flex ${sankeyNode ? "gap-4" : ""}`}>
            <div className="flex-1 min-w-0 grid grid-cols-2 gap-4">
              <div className="glass-card p-4">
                <SankeyChart
                  title="Member Demographics Flow"
                  nodes={compositionSankey.nodes}
                  links={compositionSankey.links}
                  height={380}
                  onNodeClick={(name) => {
                    if (!name) { setSankeyNode(null); return }
                    const nStats = getNodeMemberStats(name, selectedCluster ?? undefined)
                    setSankeyNode(nStats)
                  }}
                />
              </div>
              <div className="glass-card p-4">
                <SankeyChart
                  title="Risk to Cost Pathway"
                  nodes={riskFlowSankey.nodes}
                  links={riskFlowSankey.links}
                  height={380}
                  onNodeClick={(name) => {
                    if (!name) { setSankeyNode(null); return }
                    const nStats = getNodeMemberStats(name, selectedCluster ?? undefined)
                    setSankeyNode(nStats)
                  }}
                />
              </div>
            </div>

            {/* Sankey node detail pane */}
            <div className={`shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${sankeyNode ? "w-64 opacity-100" : "w-0 opacity-0"}`}>
              {sankeyNode && <SankeyNodePane node={sankeyNode} onClose={() => setSankeyNode(null)} />}
            </div>
          </div>

          {/* Scatter + Radar */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Population Map</h3>
              <ClusterScatter highlightCluster={selectedCluster} />
            </div>
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Segment Comparison</h3>
              <ClusterRadar highlightCluster={selectedCluster} />
            </div>
          </div>
        </div>

        {/* Right: always-visible panel */}
        <div className="w-80 shrink-0">
          <div className="sticky top-6 space-y-4">
            {/* Segment detail panel (when selected) */}
            {selectedCluster && stats && persona && (
              <div className="w-80 glass-card flex flex-col h-fit" style={{ borderColor: `${color}30` }}>
                {/* Panel header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-sm font-bold text-gray-900">{persona.name}</span>
                    </div>
                    <button
                      onClick={() => setSelectedCluster(null)}
                      className="text-gray-300 hover:text-gray-500 cursor-pointer p-1 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-xs text-gray-400">S{selectedCluster} - {persona.short}</div>
                </div>

                {/* Key metrics */}
                <div className="p-4 space-y-3 border-b border-gray-100">
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Key Metrics</div>
                  <div className="grid grid-cols-3 gap-2">
                    <PanelStat label="Members" value={String(stats.count)} />
                    <PanelStat label="Avg Cost" value={formatCurrency(stats.avgCost)} />
                    <PanelStat label="Risk" value={formatDecimal(stats.avgRiskScore, 3)} />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <PanelStat label="Avg Age" value={formatDecimal(stats.avgAge, 1)} />
                    <PanelStat label="Severity" value={formatDecimal(stats.avgSeverity, 2)} />
                    <PanelStat label="ER Visits" value={formatDecimal(stats.avgER, 1)} />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <PanelStat label="Diabetes" value={formatPercent(stats.pctDiabetes, 0)} />
                    <PanelStat label="Heart Dz" value={formatPercent(stats.pctHeart, 0)} />
                    <PanelStat label="ESRD" value={formatPercent(stats.pctESRD, 0)} />
                  </div>
                </div>

                {/* Persona narrative - collapsible */}
                <div className="border-b border-gray-100">
                  <button
                    onClick={() => setPersonaOpen(!personaOpen)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left cursor-pointer hover:bg-gray-50/50 transition-colors"
                  >
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Clinical Persona</span>
                    <svg
                      width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"
                      className={`transition-transform ${personaOpen ? "rotate-180" : ""}`}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {personaOpen && (
                    <div className="px-4 pb-4">
                      <p className="text-xs text-gray-600 leading-relaxed mb-3">{persona.narrative}</p>
                      <div className="space-y-1">
                        {persona.keyFeatures.map((f, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-[11px] text-gray-500">
                            <span className="text-primary mt-0.5 shrink-0">-</span>
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Recommendation */}
                <div className="p-4 border-b border-gray-100">
                  <div className="text-[10px] font-semibold text-primary-dark uppercase tracking-wider mb-2">Recommendation</div>
                  <p className="text-xs text-gray-600 leading-relaxed">{takeaway}</p>
                </div>

                {/* Action button */}
                <div className="p-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); onNavigateToIntervention?.() }}
                    className="w-full py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: 'linear-gradient(135deg, #799842, #5F7A33)' }}
                  >
                    Plan Intervention
                  </button>
                  <button className="w-full mt-2 py-2.5 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 cursor-pointer transition-all hover:bg-gray-50 hover:text-gray-700">
                    Export Segment
                  </button>
                </div>
              </div>
            )}

            {/* AI Insights pane - always visible */}
            <div className="insight-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
                  <path d="M19 13l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" opacity="0.6" />
                </svg>
                <span className="text-[10px] font-semibold text-violet-500/80 uppercase tracking-wider">
                  {selectedCluster ? `${SHORT_LABELS[selectedCluster]} - AI Insights` : "AI Generated Insights"}
                </span>
              </div>
              <div className="space-y-3">
                {selectedCluster && SEGMENT_FINDINGS[selectedCluster] ? (
                  SEGMENT_FINDINGS[selectedCluster].map((finding, i) => (
                    <SegInsightItem key={i} text={finding} />
                  ))
                ) : (
                  <>
                    <SegInsightItem text={<><span className="font-semibold text-rose-600">{highCostLabel}</span> segments (<span className="font-semibold text-rose-600">{highCostMembers}</span> members) drive costs at <span className="font-semibold text-rose-600">{formatCurrency(highCostSegs[0]?.avgCost ?? 0)}+/yr</span>.</>} />
                    <SegInsightItem text={<><span className="font-semibold text-emerald-600">{lowCostSeg.label}</span> ({lowCostSeg.count} members, {formatCurrency(lowCostSeg.avgCost)}) has the <span className="font-semibold text-emerald-600">largest intervention window</span>.</>} />
                    <SegInsightItem text={<>Rural SDOH: <span className="font-semibold text-rose-600">3-4x distance barriers</span>. Access must be solved first.</>} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bridge CTA to Intervention Planner */}
      {onNavigateToIntervention && (
        <button
          onClick={onNavigateToIntervention}
          className="bridge-card w-full p-5 cursor-pointer text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100/60 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <path d="M8 6h8M8 10h8M8 14h4" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-800">Model Intervention Scenarios</div>
              <div className="text-xs text-gray-500">Configure parameters, project savings, and calculate ROI for each segment</div>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" className="shrink-0 group-hover:translate-x-1 transition-transform">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  )
}

function SegInsightItem({ text }: { text: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-1 h-1 rounded-full bg-violet-300 mt-1.5 shrink-0" />
      <p className="text-xs text-gray-600 leading-relaxed">{text}</p>
    </div>
  )
}

function PanelStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50/80 rounded-lg p-2 text-center">
      <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">{label}</div>
      <div className="text-xs font-bold text-gray-900 mt-0.5">{value}</div>
    </div>
  )
}

function SankeyNodePane({ node, onClose }: { node: NodeStats; onClose: () => void }) {
  return (
    <div className="w-64 glass-card flex flex-col h-fit sticky top-6">
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-xs font-bold text-gray-900">{node.nodeName}</span>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 cursor-pointer p-0.5 rounded hover:bg-gray-50 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">{node.nodeCategory}</div>
      </div>

      <div className="p-3 border-b border-gray-100 text-center">
        <div className="text-2xl font-bold text-gray-900">{node.count}</div>
        <div className="text-[9px] text-gray-400 uppercase tracking-wider">members</div>
      </div>

      <div className="p-3 space-y-0 border-b border-gray-100">
        <SmallStatRow label="Avg Cost" value={formatCurrency(node.avgCost)} />
        <SmallStatRow label="Risk Score" value={formatDecimal(node.avgRiskScore, 3)} />
        <SmallStatRow label="Avg Age" value={formatDecimal(node.avgAge, 1)} />
        <SmallStatRow label="Severity" value={formatDecimal(node.avgSeverity, 2)} />
        <SmallStatRow label="ER Visits/yr" value={formatDecimal(node.avgER, 1)} />
      </div>

      <div className="p-3 space-y-0 border-b border-gray-100">
        <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Prevalence</div>
        <SmallStatRow label="Diabetes" value={`${node.pctDiabetes.toFixed(0)}%`} />
        <SmallStatRow label="Hypertension" value={`${node.pctHypertension.toFixed(0)}%`} />
        <SmallStatRow label="Heart Dz" value={`${node.pctHeartDisease.toFixed(0)}%`} />
        <SmallStatRow label="ESRD" value={`${node.pctESRD.toFixed(0)}%`} />
      </div>

      <div className="p-3">
        <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Top Segment</div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: node.topCluster.color }} />
          <span className="text-[10px] font-medium text-gray-700 truncate">{node.topCluster.name}</span>
        </div>
      </div>
    </div>
  )
}

function SmallStatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-[10px] text-gray-400">{label}</span>
      <span className="text-[11px] font-semibold text-gray-900">{value}</span>
    </div>
  )
}
