import { useState, useEffect } from "react"
import { KPICard } from "../ui/KPICard"
import { FeatureDistribution } from "../charts/FeatureDistribution"
import { SankeyChart } from "../charts/SankeyChart"
import { CountyHeatmap } from "../charts/CountyHeatmap"
import { HWHIIcon } from "../HWHIIcon"
import {
  members,
  avg,
  countWhere,
  getFeatureGroups,
  getFeaturesInGroup,
  getCountyStats,
  getPopulationFlowSankey,
  getNodeMemberStats,
  type CountyStat,
  type NodeStats,
} from "../../lib/dataUtils"
import { formatCurrencyFull, formatCurrency, formatNumber, formatDecimal } from "../../lib/format"

const GROUP_TAKEAWAYS: Record<string, string> = {
  Demographics:
    "The population spans ages 18-95 with a median around 59. Over 40% of members are 65+, driving Medicare and DSNP as dominant lines of business. The wide age range means no single intervention strategy will cover this entire cohort.",
  "Social Determinants of Health (SDOH)":
    "Members in the Delta region face 3-4x the distance to urgent care and 3x the rate of internet exclusion. 15% are flagged for health-related social needs. Food desert exposure correlates strongly with higher ER utilization.",
  "Clinical Utilization":
    "The population averages 1.4 ER visits per year, but the top quintile exceeds 4 visits. A significant subset has zero primary care engagement, using the ER as their sole point of care.",
  "Cardiometabolic Diagnostics":
    "Approximately 50% carry a diabetes diagnosis and 55% have hypertension. These conditions co-occur frequently, creating compounding metabolic risk. About 16% have ESRD and 35% carry heart disease flags.",
  "Risk & Vulnerability":
    "Risk scores span a 10x range. Frailty indices range from near-zero to 0.40, while comorbidity scores range from 0 to 9. The top quartile exceeds 0.55 on the cardiometabolic risk score, identifying members who need immediate intervention.",
  Financial:
    "Average cost per member per year is ~$51K, but the distribution is heavily skewed: the top 15% drive over 60% of total spend. Inpatient admissions are the single largest cost category.",
  Outcomes:
    "Over 30% are flagged by the high-risk utilization measure (ER-only care or 3+ ER visits). This identifies members falling through gaps in the care system.",
}

const GROUP_SHORT_NAMES: Record<string, string> = {
  Demographics: "Demographics",
  "Social Determinants of Health (SDOH)": "Social Determinants",
  "Clinical Utilization": "Utilization",
  "Cardiometabolic Diagnostics": "Diagnostics",
  "Risk & Vulnerability": "Risk Scores",
  Financial: "Financial",
  Outcomes: "Outcomes",
}

interface PopulationOverviewProps {
  onFeatureGroupChange?: (group: string) => void
  onBack?: () => void
  onNavigateToSegments?: () => void
}

export function PopulationOverview({ onFeatureGroupChange, onBack, onNavigateToSegments }: PopulationOverviewProps) {
  const groups = getFeatureGroups()
  const [group, setGroup] = useState(groups[0])
  const [heatmapMetric, setHeatmapMetric] = useState<"avgRiskScore" | "avgCost" | "memberCount">("avgRiskScore")
  const [selectedCounty, setSelectedCounty] = useState<CountyStat | null>(null)
  const [featureView, setFeatureView] = useState<"grid" | "expanded">("grid")
  const [sankeyNode, setSankeyNode] = useState<NodeStats | null>(null)

  const handleGroupChange = (g: string) => {
    setGroup(g)
    onFeatureGroupChange?.(g)
  }

  useEffect(() => {
    onFeatureGroupChange?.(group)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const features = getFeaturesInGroup(group)
  const countyStats = getCountyStats()
  const populationSankey = getPopulationFlowSankey()

  const totalMembers = members.length
  const avgAge = avg(members.map((m) => m.age_at_pred))
  const avgCost = avg(members.map((m) => m.pmpy))
  const avgRiskScore = avg(members.map((m) => m.cardio_metabolic_risk_score))

  const takeaway = GROUP_TAKEAWAYS[group] || GROUP_TAKEAWAYS["Demographics"]

  const topRiskCounties = [...countyStats].sort((a, b) => b.avgRiskScore - a.avgRiskScore).slice(0, 5)

  // Computed findings
  const highRiskMembers = members.filter(m => m.cardio_metabolic_risk_score >= 0.45)
  const highRiskPct = ((highRiskMembers.length / totalMembers) * 100).toFixed(0)
  const highRiskAvgCost = avg(highRiskMembers.map(m => m.pmpy))
  const diabetesPct = ((countWhere(members, "DIABETES_FLAG" as keyof typeof members[0], 1) / totalMembers) * 100).toFixed(0)
  const hyperPct = ((countWhere(members, "HYPER_FLAG" as keyof typeof members[0], 1) / totalMembers) * 100).toFixed(0)
  const top5AvgRisk = avg(topRiskCounties.map(c => c.avgRiskScore))
  const topCountyOverAvg = (((top5AvgRisk - avgRiskScore) / avgRiskScore) * 100).toFixed(0)

  const gridCols = featureView === "expanded"
    ? "grid-cols-2"
    : features.length <= 3 ? "grid-cols-3" : features.length <= 4 ? "grid-cols-2" : "grid-cols-4"

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
            <h2 className="text-xl font-bold text-gray-900">Risk Intelligence</h2>
            <p className="text-sm text-gray-500">500-member Arkansas cohort</p>
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

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Total Members" value={formatNumber(totalMembers)} subtitle="Arkansas cohort" />
        <KPICard label="Average Age" value={formatDecimal(avgAge, 1)} subtitle="years" />
        <KPICard label="Avg Annual Cost" value={formatCurrencyFull(avgCost)} subtitle="per member per year" />
        <KPICard label="Avg Risk Score" value={formatDecimal(avgRiskScore, 3)} subtitle="cardiometabolic (0-1)" />
      </div>

      {/* Main content + AI Insights side pane */}
      <div className="flex gap-5">
        {/* Left: all visualizations */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Population flow sankey + detail pane */}
          <div className={`flex ${sankeyNode ? "gap-4" : ""}`}>
            <div className="flex-1 min-w-0 glass-card p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Population Flow</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Click any node to explore that cohort</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{backgroundColor:'#89BEC0'}} />Age</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{backgroundColor:'#B0A5D4'}} />Insurance</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{backgroundColor:'#E8BA98'}} />Risk</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{backgroundColor:'#D8A8B8'}} />Cost</span>
                </div>
              </div>
              <SankeyChart
                title=""
                nodes={populationSankey.nodes}
                links={populationSankey.links}
                height={400}
                onNodeClick={(name) => {
                  if (!name) { setSankeyNode(null); return }
                  const stats = getNodeMemberStats(name)
                  setSankeyNode(stats)
                }}
              />
            </div>

            {/* Sankey detail pane */}
            <div className={`shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${sankeyNode ? "w-72 opacity-100" : "w-0 opacity-0"}`}>
              {sankeyNode && <SankeyDetailPane node={sankeyNode} onClose={() => setSankeyNode(null)} />}
            </div>
          </div>

          {/* Feature Explorer */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Feature Explorer</h3>
              {/* View toggle */}
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setFeatureView("grid")}
                  className={`px-2.5 py-1.5 cursor-pointer transition-colors ${featureView === "grid" ? "bg-gray-100 text-gray-700" : "text-gray-400 hover:text-gray-600"}`}
                  title="Grid view"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                  </svg>
                </button>
                <button
                  onClick={() => setFeatureView("expanded")}
                  className={`px-2.5 py-1.5 cursor-pointer transition-colors ${featureView === "expanded" ? "bg-gray-100 text-gray-700" : "text-gray-400 hover:text-gray-600"}`}
                  title="Expanded view"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="8" /><rect x="3" y="14" width="18" height="8" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Category pill selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {groups.map((g) => (
                <button
                  key={g}
                  onClick={() => handleGroupChange(g)}
                  className={`category-pill px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                    group === g
                      ? "active text-primary-dark"
                      : "text-gray-500 bg-white hover:text-gray-700"
                  }`}
                >
                  {GROUP_SHORT_NAMES[g] || g}
                </button>
              ))}
            </div>

            {/* Feature grid */}
            <div className={`grid ${gridCols} gap-3`}>
              {features.map((f) => (
                <div key={f} className="rounded-lg bg-gray-50/50 border border-gray-100 p-1">
                  <FeatureDistribution feature={f} compact={featureView === "grid"} />
                </div>
              ))}
            </div>

            {/* Feature group takeaway */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-start gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
              </svg>
              <p className="text-xs text-gray-500 leading-relaxed">{takeaway}</p>
            </div>
          </div>

          {/* Geographic Insights */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Geographic Risk</h3>
                <p className="text-xs text-gray-400 mt-0.5">Click any county for details</p>
              </div>
              <select
                value={heatmapMetric}
                onChange={(e) => setHeatmapMetric(e.target.value as typeof heatmapMetric)}
                className="bg-white border border-gray-200 text-gray-700 text-xs rounded-lg px-3 py-2 cursor-pointer"
              >
                <option value="avgRiskScore">Risk Score</option>
                <option value="avgCost">Average Annual Cost</option>
                <option value="memberCount">Member Count</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <CountyHeatmap
                  countyStats={countyStats}
                  metric={heatmapMetric}
                  height={460}
                  onCountyClick={setSelectedCounty}
                  selectedCounty={selectedCounty?.name ?? null}
                />
              </div>

              <div className="bg-gray-50/50 rounded-lg border border-gray-100 p-4 flex flex-col">
                {selectedCounty ? (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-xs font-semibold text-primary-dark uppercase tracking-wider">Selected County</div>
                        <div className="text-lg font-bold text-gray-900 mt-0.5">{selectedCounty.name}</div>
                      </div>
                      <button
                        onClick={() => setSelectedCounty(null)}
                        className="text-gray-300 hover:text-gray-500 cursor-pointer p-1"
                        title="Clear selection"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-0 flex-1">
                      <CountyStatRow label="Members" value={String(selectedCounty.memberCount)} />
                      <CountyStatRow label="Risk Score" value={selectedCounty.avgRiskScore.toFixed(3)} />
                      <CountyStatRow label="Avg Annual Cost" value={formatCurrency(selectedCounty.avgCost)} />
                      <CountyStatRow label="Avg Age" value={formatDecimal(selectedCounty.avgAge, 1)} />
                      <CountyStatRow label="Comorbidity (CCI)" value={formatDecimal(selectedCounty.avgComorbidity, 1)} />
                      <CountyStatRow label="Frailty Index" value={formatDecimal(selectedCounty.avgFrailty, 3)} />
                      <CountyStatRow label="Avg ER Visits" value={formatDecimal(selectedCounty.avgERVisits, 1)} />
                      <div className="pt-2 pb-1">
                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Prevalence</div>
                      </div>
                      <CountyStatRow label="Diabetes" value={`${selectedCounty.pctDiabetes.toFixed(0)}%`} />
                      <CountyStatRow label="Hypertension" value={`${selectedCounty.pctHypertension.toFixed(0)}%`} />
                      <CountyStatRow label="Heart Disease" value={`${selectedCounty.pctHeartDisease.toFixed(0)}%`} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Top Risk Counties</div>
                    <div className="space-y-1 flex-1">
                      {topRiskCounties.map((county, i) => (
                        <button
                          key={county.name}
                          onClick={() => setSelectedCounty(county)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-left"
                        >
                          <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-800 truncate">{county.name}</div>
                            <div className="text-xs text-gray-400">{county.memberCount} members</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-semibold text-gray-900">{county.avgRiskScore.toFixed(3)}</div>
                            <div className="text-xs text-gray-400">{formatCurrency(county.avgCost)}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="pt-3 mt-2 border-t border-gray-100">
                      <p className="text-[10px] text-gray-400 text-center">Click a county on the map for full details</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bridge CTA → Segment Studio */}
          {onNavigateToSegments && (
            <button
              onClick={onNavigateToSegments}
              className="bridge-card w-full p-5 flex items-center justify-between cursor-pointer text-left group"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
                  </svg>
                  <span className="text-xs font-semibold text-indigo-500/80 uppercase tracking-wider">Next Step</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">6 distinct segments identified with unique cost profiles and intervention opportunities.</p>
                <p className="text-xs text-gray-400 mt-1">Explore segment-level strategies and recommended actions.</p>
              </div>
              <div className="shrink-0 ml-6 flex items-center gap-2 text-indigo-500 group-hover:translate-x-1 transition-transform">
                <span className="text-sm font-semibold">Open Segment Studio</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          )}
        </div>

        {/* Right: AI Insights pane */}
        <div className="w-64 shrink-0">
          <div className="sticky top-6">
            <div className="insight-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
                  <path d="M19 13l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" opacity="0.6" />
                </svg>
                <span className="text-[10px] font-semibold text-violet-500/80 uppercase tracking-wider">AI Generated Insights</span>
              </div>

              <div className="space-y-3">
                <InsightItem text={<><span className="font-semibold text-rose-600">{highRiskPct}%</span> in High/Critical Risk at <span className="font-semibold text-rose-600">{formatCurrencyFull(highRiskAvgCost)}/yr</span> - 2x population mean.</>} />
                <InsightItem text={<><span className="font-semibold text-rose-600">{diabetesPct}% diabetes</span>, <span className="font-semibold text-rose-600">{hyperPct}% hypertension</span>. Compounding metabolic risk.</>} />
                <InsightItem text={<><span className="font-semibold text-rose-600">5 Delta counties</span> show risk <span className="font-semibold text-rose-600">{topCountyOverAvg}% above</span> avg. Geographic targeting warranted.</>} />
                <InsightItem text={<>Top 15% drive <span className="font-semibold text-rose-600">60%+ of total spend</span>. Heavily right-skewed cost distribution.</>} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InsightItem({ text }: { text: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-1 h-1 rounded-full bg-violet-300 mt-1.5 shrink-0" />
      <p className="text-xs text-gray-600 leading-relaxed">{text}</p>
    </div>
  )
}

function CountyStatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  )
}

function SankeyDetailPane({ node, onClose }: { node: NodeStats; onClose: () => void }) {
  return (
    <div className="w-72 glass-card flex flex-col h-fit sticky top-6">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-bold text-gray-900">{node.nodeName}</span>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-gray-500 cursor-pointer p-1 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{node.nodeCategory}</div>
      </div>

      {/* Headline stat */}
      <div className="p-4 border-b border-gray-100 text-center">
        <div className="text-3xl font-bold text-gray-900">{node.count}</div>
        <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">members</div>
        <div className="text-xs text-gray-500 mt-1">{((node.count / 500) * 100).toFixed(0)}% of population</div>
      </div>

      {/* Key metrics */}
      <div className="p-4 space-y-0 border-b border-gray-100">
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Profile</div>
        <NodeStatRow label="Avg Age" value={formatDecimal(node.avgAge, 1)} />
        <NodeStatRow label="Avg Annual Cost" value={formatCurrency(node.avgCost)} />
        <NodeStatRow label="Avg Risk Score" value={formatDecimal(node.avgRiskScore, 3)} />
        <NodeStatRow label="Avg Severity" value={formatDecimal(node.avgSeverity, 2)} />
        <NodeStatRow label="ER Visits/yr" value={formatDecimal(node.avgER, 1)} />
        <NodeStatRow label="Frailty Index" value={formatDecimal(node.avgFrailty, 3)} />
      </div>

      {/* Prevalence */}
      <div className="p-4 space-y-0 border-b border-gray-100">
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Prevalence</div>
        <NodeStatRow label="Diabetes" value={`${node.pctDiabetes.toFixed(0)}%`} />
        <NodeStatRow label="Hypertension" value={`${node.pctHypertension.toFixed(0)}%`} />
        <NodeStatRow label="Heart Disease" value={`${node.pctHeartDisease.toFixed(0)}%`} />
        <NodeStatRow label="ESRD" value={`${node.pctESRD.toFixed(0)}%`} />
      </div>

      {/* Top segment */}
      <div className="p-4">
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Primary Segment</div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: node.topCluster.color }} />
          <span className="text-xs font-medium text-gray-700">{node.topCluster.name}</span>
          <span className="text-[10px] text-gray-400 ml-auto">{node.topCluster.count} members</span>
        </div>
      </div>
    </div>
  )
}

function NodeStatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-[11px] text-gray-400">{label}</span>
      <span className="text-xs font-semibold text-gray-900">{value}</span>
    </div>
  )
}
