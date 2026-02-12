import { useState, useEffect } from "react"
import { KPICard } from "../ui/KPICard"
import { FeatureDistribution } from "../charts/FeatureDistribution"
import { SankeyChart } from "../charts/SankeyChart"
import { CountyHeatmap } from "../charts/CountyHeatmap"
import {
  members,
  avg,
  getFeatureGroups,
  getFeaturesInGroup,
  getCountyStats,
  getPopulationFlowSankey,
  type CountyStat,
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

// Short display names for category pills
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
}

export function PopulationOverview({ onFeatureGroupChange, onBack }: PopulationOverviewProps) {
  const groups = getFeatureGroups()
  const [group, setGroup] = useState(groups[0])
  const [heatmapMetric, setHeatmapMetric] = useState<"avgRiskScore" | "avgCost" | "memberCount">("avgRiskScore")
  const [selectedCounty, setSelectedCounty] = useState<CountyStat | null>(null)

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

  // Top 5 highest risk counties
  const topRiskCounties = [...countyStats].sort((a, b) => b.avgRiskScore - a.avgRiskScore).slice(0, 5)

  // Grid columns based on feature count
  const gridCols = features.length <= 3 ? "grid-cols-3" : features.length <= 4 ? "grid-cols-2" : "grid-cols-4"

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
          <h2 className="text-xl font-bold text-gray-900">Population Overview</h2>
          <p className="text-sm text-gray-500">500-member Arkansas cohort at a glance</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Total Members" value={formatNumber(totalMembers)} subtitle="Arkansas cohort" />
        <KPICard label="Average Age" value={formatDecimal(avgAge, 1)} subtitle="years" />
        <KPICard label="Average Annual Cost" value={formatCurrencyFull(avgCost)} subtitle="per member per year" />
        <KPICard label="Avg Risk Score" value={formatDecimal(avgRiskScore, 3)} subtitle="cardiometabolic (0-1)" />
      </div>

      {/* Population flow sankey */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Population Flow</h3>
            <p className="text-xs text-gray-400 mt-0.5">How members flow from demographics through insurance, risk levels, and cost impact</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" />Age</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500" />Insurance</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" />Risk</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-pink-400" />Cost</span>
          </div>
        </div>
        <SankeyChart
          title=""
          nodes={populationSankey.nodes}
          links={populationSankey.links}
          height={400}
        />
      </div>

      {/* Feature Explorer - category pills + grid of all features */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Feature Explorer</h3>

        {/* Category pill selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {groups.map((g) => (
            <button
              key={g}
              onClick={() => handleGroupChange(g)}
              className={`category-pill px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                group === g
                  ? "active text-blue-700 bg-blue-50"
                  : "text-gray-500 bg-white hover:text-gray-700"
              }`}
            >
              {GROUP_SHORT_NAMES[g] || g}
            </button>
          ))}
        </div>

        {/* Grid of all features in selected category */}
        <div className={`grid ${gridCols} gap-3`}>
          {features.map((f) => (
            <div key={f} className="rounded-lg bg-gray-50/50 border border-gray-100 p-1">
              <FeatureDistribution feature={f} compact={true} />
            </div>
          ))}
        </div>
      </div>

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

      {/* Geographic Insights section */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 32 32" className="shrink-0">
              <circle cx="16" cy="16" r="14" fill="#FF612B" />
              <circle cx="16" cy="16" r="6" fill="white" opacity="0.9" />
              <circle cx="16" cy="16" r="2.5" fill="#FF612B" />
            </svg>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Geographic Insights</h3>
              <p className="text-sm text-gray-500">Click any county for details</p>
            </div>
          </div>
          <select
            value={heatmapMetric}
            onChange={(e) => setHeatmapMetric(e.target.value as typeof heatmapMetric)}
            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 cursor-pointer"
          >
            <option value="avgRiskScore">Risk Score</option>
            <option value="avgCost">Average Annual Cost</option>
            <option value="memberCount">Member Count</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Map - 2/3 width */}
          <div className="col-span-2 glass-card p-4">
            <CountyHeatmap
              countyStats={countyStats}
              metric={heatmapMetric}
              height={500}
              onCountyClick={setSelectedCounty}
              selectedCounty={selectedCounty?.name ?? null}
            />
          </div>

          {/* Stats panel - 1/3 width with blue hue */}
          <div className="glass-card p-4 flex flex-col" style={{ border: '2px solid rgba(96, 165, 250, 0.4)', boxShadow: '0 0 12px rgba(96, 165, 250, 0.1)' }}>
            {selectedCounty ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Selected County</div>
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
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50/50 transition-colors cursor-pointer text-left"
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
                <div className="pt-3 mt-2 border-t border-blue-100">
                  <p className="text-[10px] text-gray-400 text-center">Click a county on the map for full details</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
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
