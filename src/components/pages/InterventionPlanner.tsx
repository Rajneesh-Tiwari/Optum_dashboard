import { useState, useMemo } from "react"
import { HWHIIcon } from "../HWHIIcon"
import { WaterfallChart } from "../charts/WaterfallChart"
import { BeforeAfterCostChart } from "../charts/BeforeAfterCostChart"
import {
  clusterCostBreakdown,
  clusterStats,
  CLUSTER_COLORS,
  type CostBreakdown,
} from "../../lib/dataUtils"
import {
  INTERVENTION_CONFIGS,
  calculateROI,
  type SliderState,
  type ROIResult,
} from "../../data/interventionConfigs"
import { formatCurrency, formatCurrencyFull, formatNumber } from "../../lib/format"

const SHORT_LABELS: Record<number, string> = {
  1: "At-Risk",
  2: "Metabolic",
  3: "Heart Failure",
  4: "ESRD",
  5: "Rural SDOH",
  6: "Frail Elderly",
}

const ALL_CLUSTERS = [1, 2, 3, 4, 5, 6]

function getInitialSliderStates(): Record<number, SliderState> {
  const states: Record<number, SliderState> = {}
  for (const c of ALL_CLUSTERS) {
    states[c] = { ...INTERVENTION_CONFIGS[c].defaults }
  }
  return states
}

interface InterventionPlannerProps {
  onBack?: () => void
}

export function InterventionPlanner({ onBack }: InterventionPlannerProps) {
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null)
  const [sliderStates, setSliderStates] = useState<Record<number, SliderState>>(getInitialSliderStates)

  // Precompute cost breakdowns for all clusters
  const costBreakdowns = useMemo(() => {
    const map: Record<number, CostBreakdown> = {}
    for (const c of ALL_CLUSTERS) map[c] = clusterCostBreakdown(c)
    return map
  }, [])

  // ROI results for all clusters
  const allROI = useMemo(() => {
    const map: Record<number, ROIResult> = {}
    for (const c of ALL_CLUSTERS) {
      map[c] = calculateROI(costBreakdowns[c], sliderStates[c])
    }
    return map
  }, [costBreakdowns, sliderStates])

  const currentROI = selectedCluster ? allROI[selectedCluster] : null
  const currentCosts = selectedCluster ? costBreakdowns[selectedCluster] : null
  const currentConfig = selectedCluster ? INTERVENTION_CONFIGS[selectedCluster] : null
  const currentSliders = selectedCluster ? sliderStates[selectedCluster] : null

  const updateSlider = (key: keyof SliderState, value: number) => {
    if (!selectedCluster) return
    setSliderStates((prev) => ({
      ...prev,
      [selectedCluster]: { ...prev[selectedCluster], [key]: value },
    }))
  }

  // Portfolio totals
  const portfolioTotals = useMemo(() => {
    let totalCurrentCost = 0
    let totalProjectedCost = 0
    let totalAnnualSavings = 0
    for (const c of ALL_CLUSTERS) {
      const costs = costBreakdowns[c]
      const roi = allROI[c]
      totalCurrentCost += costs.total * costs.count
      totalProjectedCost += roi.projectedPMPY * costs.count
      totalAnnualSavings += roi.netAfterProgram * roi.impactedMembers
    }
    return { totalCurrentCost, totalProjectedCost, totalAnnualSavings }
  }, [costBreakdowns, allROI])

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
            <h2 className="text-xl font-bold text-gray-900">Intervention Planner</h2>
            <p className="text-sm text-gray-500">Model intervention scenarios and projected ROI by segment</p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-500 text-xs rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50 hover:text-gray-700 transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Export
        </button>
      </div>

      {/* Segment selector pills */}
      <div>
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Segments</div>
        <div className="grid grid-cols-6 gap-3">
          {ALL_CLUSTERS.map((c) => {
            const isSelected = selectedCluster === c
            const s = clusterStats(c)
            const clr = CLUSTER_COLORS[c]
            return (
              <button
                key={c}
                onClick={() => setSelectedCluster(isSelected ? null : c)}
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
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: clr }} />
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
      </div>

      {/* Main content + AI panel */}
      <div className="flex gap-5">
        {/* Left column */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Intervention config + sliders */}
          {selectedCluster && currentCosts && currentSliders && currentConfig && currentROI && (
            <>
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{currentConfig.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {currentCosts.count} members - Current avg: {formatCurrencyFull(currentCosts.total)}/yr
                    </p>
                  </div>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CLUSTER_COLORS[selectedCluster] }}
                  />
                </div>

                <div className="space-y-4">
                  <SliderControl
                    label="Population Reach"
                    value={currentSliders.populationReachPct}
                    min={10} max={100} step={5}
                    formatter={(v) => `${v}%`}
                    helpText={`${Math.round(currentCosts.count * currentSliders.populationReachPct / 100)} of ${currentCosts.count} members`}
                    onChange={(v) => updateSlider("populationReachPct", v)}
                  />
                  <SliderControl
                    label="IP Cost Reduction"
                    value={currentSliders.ipReductionPct}
                    min={0} max={50} step={1}
                    formatter={(v) => `${v}%`}
                    helpText={`Saves ${formatCurrencyFull(currentCosts.ip * currentSliders.ipReductionPct / 100)}/member/yr`}
                    onChange={(v) => updateSlider("ipReductionPct", v)}
                  />
                  <SliderControl
                    label="OP Cost Reduction"
                    value={currentSliders.opReductionPct}
                    min={0} max={30} step={1}
                    formatter={(v) => `${v}%`}
                    helpText={`Saves ${formatCurrencyFull(currentCosts.op * currentSliders.opReductionPct / 100)}/member/yr`}
                    onChange={(v) => updateSlider("opReductionPct", v)}
                  />
                  <SliderControl
                    label="Physician Spend Increase"
                    value={currentSliders.physIncreasePct}
                    min={0} max={100} step={1}
                    formatter={(v) => `${v}%`}
                    helpText={`+${formatCurrencyFull(currentCosts.phys * currentSliders.physIncreasePct / 100)}/member/yr`}
                    onChange={(v) => updateSlider("physIncreasePct", v)}
                  />
                  <SliderControl
                    label="Program Cost ($/member/month)"
                    value={currentSliders.programCostPMPM}
                    min={0} max={2000} step={25}
                    formatter={(v) => `$${v}`}
                    helpText={`${formatCurrencyFull(currentSliders.programCostPMPM * 12)}/member/yr`}
                    onChange={(v) => updateSlider("programCostPMPM", v)}
                  />
                </div>
              </div>

              {/* ROI Results */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-bold text-gray-800 mb-3">ROI Summary</h3>
                <div className="grid grid-cols-4 gap-3">
                  <ROIMetric
                    label="Net Savings PMPY"
                    value={formatCurrencyFull(currentROI.netAfterProgram)}
                    positive={currentROI.netAfterProgram > 0}
                  />
                  <ROIMetric
                    label="Annual Net Savings"
                    value={formatCurrencyFull(currentROI.netAfterProgram * currentROI.impactedMembers)}
                    positive={currentROI.netAfterProgram > 0}
                  />
                  <ROIMetric
                    label="ROI Ratio"
                    value={`${currentROI.roiRatio.toFixed(1)}x`}
                    positive={currentROI.roiRatio > 1}
                  />
                  <ROIMetric
                    label="Break-Even"
                    value={currentROI.breakEvenMonths >= 999 ? "N/A" : `${currentROI.breakEvenMonths.toFixed(1)} mo`}
                    positive={currentROI.breakEvenMonths < 12}
                  />
                </div>
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">Savings Waterfall (PMPY)</h3>
                  <WaterfallChart
                    items={[
                      { label: "Baseline", value: currentCosts.total, isTotal: true },
                      { label: "IP Savings", value: currentROI.ipSavings },
                      { label: "OP Savings", value: currentROI.opSavings },
                      { label: "Phys. Increase", value: -currentROI.physIncrease },
                      { label: "Program Cost", value: -currentROI.programCostAnnual },
                      { label: "Net PMPY", value: currentROI.projectedPMPY, isTotal: true },
                    ]}
                    height={300}
                  />
                </div>
                <div className="glass-card p-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">Cost Category: Current vs. Projected</h3>
                  <BeforeAfterCostChart
                    before={{
                      ip: currentCosts.ip,
                      op: currentCosts.op,
                      phys: currentCosts.phys,
                      rx: currentCosts.rx,
                    }}
                    after={{
                      ip: currentCosts.ip * (1 - currentSliders.ipReductionPct / 100),
                      op: currentCosts.op * (1 - currentSliders.opReductionPct / 100),
                      phys: currentCosts.phys * (1 + currentSliders.physIncreasePct / 100),
                      rx: currentCosts.rx,
                    }}
                    clusterColor={CLUSTER_COLORS[selectedCluster]}
                    height={300}
                  />
                </div>
              </div>
            </>
          )}

          {/* No segment selected prompt */}
          {!selectedCluster && (
            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-700 mb-1">Select a Segment</h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto">
                Choose a segment above to configure intervention parameters and model projected ROI.
              </p>
            </div>
          )}

          {/* Portfolio summary table - always visible */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Portfolio Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 pr-3 font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Segment</th>
                    <th className="text-right py-2 px-2 font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Members</th>
                    <th className="text-right py-2 px-2 font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Current PMPY</th>
                    <th className="text-right py-2 px-2 font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Projected PMPY</th>
                    <th className="text-right py-2 px-2 font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Savings PMPY</th>
                    <th className="text-right py-2 px-2 font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Annual Savings</th>
                    <th className="text-right py-2 pl-2 font-semibold text-gray-400 uppercase tracking-wider text-[10px]">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {ALL_CLUSTERS.map((c) => {
                    const costs = costBreakdowns[c]
                    const roi = allROI[c]
                    const isActive = selectedCluster === c
                    return (
                      <tr
                        key={c}
                        onClick={() => setSelectedCluster(isActive ? null : c)}
                        className={`border-b border-gray-50 cursor-pointer transition-colors ${
                          isActive ? "bg-gray-50" : "hover:bg-gray-50/50"
                        }`}
                      >
                        <td className="py-2.5 pr-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CLUSTER_COLORS[c] }} />
                            <span className="font-medium text-gray-700">S{c}: {SHORT_LABELS[c]}</span>
                          </div>
                        </td>
                        <td className="text-right py-2.5 px-2 text-gray-600">{formatNumber(costs.count)}</td>
                        <td className="text-right py-2.5 px-2 text-gray-600">{formatCurrencyFull(costs.total)}</td>
                        <td className="text-right py-2.5 px-2 text-gray-600">{formatCurrencyFull(roi.projectedPMPY)}</td>
                        <td className={`text-right py-2.5 px-2 font-medium ${roi.netAfterProgram > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {roi.netAfterProgram > 0 ? "-" : "+"}{formatCurrencyFull(Math.abs(roi.netAfterProgram))}
                        </td>
                        <td className={`text-right py-2.5 px-2 font-medium ${roi.netAfterProgram > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {formatCurrencyFull(roi.netAfterProgram * roi.impactedMembers)}
                        </td>
                        <td className={`text-right py-2.5 pl-2 font-medium ${roi.roiRatio > 1 ? "text-emerald-600" : "text-rose-600"}`}>
                          {roi.roiRatio.toFixed(1)}x
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200">
                    <td className="py-2.5 pr-3 font-bold text-gray-900">Portfolio Total</td>
                    <td className="text-right py-2.5 px-2 font-bold text-gray-900">{formatNumber(500)}</td>
                    <td className="text-right py-2.5 px-2 font-bold text-gray-900">{formatCurrency(portfolioTotals.totalCurrentCost)}</td>
                    <td className="text-right py-2.5 px-2 font-bold text-gray-900">{formatCurrency(portfolioTotals.totalProjectedCost)}</td>
                    <td colSpan={1} className="text-right py-2.5 px-2" />
                    <td className={`text-right py-2.5 px-2 font-bold ${portfolioTotals.totalAnnualSavings > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {formatCurrencyFull(portfolioTotals.totalAnnualSavings)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Right column - AI insights */}
        <div className="w-80 shrink-0">
          <div className="sticky top-6 space-y-4">
            {/* AI Insights */}
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
                {selectedCluster && currentROI && currentConfig ? (
                  <>
                    <InsightItem text={
                      currentROI.netAfterProgram > 0
                        ? <><span className="font-semibold text-emerald-600">{formatCurrencyFull(currentROI.netAfterProgram)}</span> net savings per member per year after program costs. ROI of <span className="font-semibold text-emerald-600">{currentROI.roiRatio.toFixed(1)}x</span>.</>
                        : <><span className="font-semibold text-rose-600">Net cost of {formatCurrencyFull(Math.abs(currentROI.netAfterProgram))}</span> per member per year. Adjust sliders to improve ROI.</>
                    } />
                    <InsightItem text={
                      <>Reaching <span className="font-semibold text-gray-900">{currentROI.impactedMembers}</span> members yields <span className={`font-semibold ${currentROI.netAfterProgram > 0 ? "text-emerald-600" : "text-rose-600"}`}>{formatCurrencyFull(currentROI.netAfterProgram * currentROI.impactedMembers)}</span> annual portfolio impact.</>
                    } />
                    <InsightItem text={
                      currentROI.breakEvenMonths < 999
                        ? <>Break-even at <span className="font-semibold text-gray-900">{currentROI.breakEvenMonths.toFixed(1)} months</span>. {currentROI.breakEvenMonths < 6 ? "Fast payback - high priority." : currentROI.breakEvenMonths < 12 ? "Payback within first year." : "Consider phased rollout."}</>
                        : <><span className="font-semibold text-rose-600">No break-even achievable</span> with current parameters. Net savings are negative after physician increase.</>
                    } />
                  </>
                ) : (
                  <>
                    <InsightItem text={
                      <>Portfolio total annual savings: <span className={`font-semibold ${portfolioTotals.totalAnnualSavings > 0 ? "text-emerald-600" : "text-rose-600"}`}>{formatCurrencyFull(portfolioTotals.totalAnnualSavings)}</span> across all segments with default parameters.</>
                    } />
                    <InsightItem text={(() => {
                      const bestROI = ALL_CLUSTERS.reduce((best, c) =>
                        allROI[c].roiRatio > allROI[best].roiRatio ? c : best, 1)
                      return <><span className="font-semibold text-emerald-600">S{bestROI}: {SHORT_LABELS[bestROI]}</span> has the highest ROI at <span className="font-semibold text-emerald-600">{allROI[bestROI].roiRatio.toFixed(1)}x</span>. Select it to model scenarios.</>
                    })()} />
                    <InsightItem text="Select a segment to configure intervention parameters and see detailed savings projections." />
                  </>
                )}
              </div>
            </div>

            {/* Intervention narrative */}
            {selectedCluster && currentConfig && (
              <div className="narrative-card p-4">
                <div className="text-[10px] font-semibold text-blue-500/70 uppercase tracking-wider mb-2">Intervention Rationale</div>
                <p className="text-xs text-gray-600 leading-relaxed mb-3">{currentConfig.narrative}</p>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Evidence</div>
                <div className="space-y-1.5">
                  {currentConfig.evidence.map((e, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[10px] text-gray-500">
                      <span className="text-blue-400 mt-0.5 shrink-0">-</span>
                      <a
                        href={e.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="leading-relaxed hover:text-blue-600 hover:underline transition-colors"
                      >
                        {e.label}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Helper components ────────────────────────────────────────────

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  formatter,
  helpText,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  formatter: (v: number) => string
  helpText?: string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className="text-xs font-bold text-gray-900">{formatter(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      {helpText && (
        <div className="text-[10px] text-gray-400 mt-0.5">{helpText}</div>
      )}
    </div>
  )
}

function ROIMetric({
  label,
  value,
  positive,
}: {
  label: string
  value: string
  positive: boolean
}) {
  return (
    <div className={`rounded-xl p-3 text-center border ${
      positive ? "bg-emerald-50/50 border-emerald-100" : "bg-rose-50/50 border-rose-100"
    }`}>
      <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-sm font-bold ${positive ? "text-emerald-700" : "text-rose-700"}`}>{value}</div>
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
