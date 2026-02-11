import { ClusterCard } from "../ui/ClusterCard"
import { ClusterScatter } from "../charts/ClusterScatter"
import { ClusterRadar } from "../charts/ClusterRadar"
import { clusterStats, CLUSTER_COLORS, CLUSTER_NAMES } from "../../lib/dataUtils"
import { formatCurrency, formatDecimal, formatPercent } from "../../lib/format"

interface AISegmentationProps {
  highlightCluster: number | null
  onHighlightCluster: (c: number | null) => void
}

const CLUSTER_TAKEAWAYS: Record<number, string> = {
  1: "Cluster 1 (At-Risk Baseline) is the youngest, lowest-cost segment. These members are in the early stages of hypertension with standard PCP adherence. The intervention window is 12-18 months before disease trajectory accelerates toward Clusters 2-3.",
  2: "Cluster 2 (Unmanaged Metabolic Syndrome) sits at a critical inflection point. 100% carry dual diabetes + hypertension. Without intensive management, 15-20% will experience cardiac events within 2 years, and many will progress to Cluster 4 (ESRD).",
  3: "Cluster 3 (Advanced Heart Failure) drives disproportionate acute-care spend. A 35% 30-day readmission rate is 3x the national average. Remote monitoring and care transition programs offer the fastest ROI in this segment.",
  4: "Cluster 4 (Diabetic Nephropathy/ESRD) contains the most expensive individual members. ESRD management averages $90K+/year per member. The highest-value intervention is pre-ESRD diversion for the 20% not yet on dialysis.",
  5: "Cluster 5 (Rural SDOH Crisis) is uniquely defined by zero PCP engagement and extreme geographic isolation. This is fundamentally an access problem - clinical programs will fail without first solving transportation, broadband, and community health worker deployment.",
  6: "Cluster 6 (Frail Elderly Complex) has the highest comorbidity burden (CCI 4-9) and frailty index. Quality-of-life-focused interventions - polypharmacy review, advance care planning, home-based primary care - outperform aggressive disease management.",
}

export function AISegmentation({ highlightCluster, onHighlightCluster }: AISegmentationProps) {
  const clusters = [1, 2, 3, 4, 5, 6]

  const takeaway = highlightCluster
    ? CLUSTER_TAKEAWAYS[highlightCluster]
    : "There is actionable structure in this complexity. Six distinct clinical archetypes emerge from the data, each with a unique cost profile, utilization pattern, and intervention opportunity. Click a cluster card above to highlight it and see a specific takeaway."

  const takeawayColor = highlightCluster ? CLUSTER_COLORS[highlightCluster] : "#FF612B"

  // Stats for highlighted cluster
  const highlightStats = highlightCluster ? clusterStats(highlightCluster) : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100">AI Segmentation</h2>
        <p className="text-sm text-slate-400 mt-1">
          The AI found 6 distinct clusters hiding in the population
        </p>
      </div>

      <div className="grid grid-cols-6 gap-3">
        {clusters.map((c) => {
          const s = clusterStats(c)
          return (
            <ClusterCard
              key={c}
              id={c}
              name={CLUSTER_NAMES[c]}
              color={CLUSTER_COLORS[c]}
              count={s.count}
              avgCost={formatCurrency(s.avgCost)}
              avgAge={formatDecimal(s.avgAge, 0)}
              selected={highlightCluster === c}
              onClick={() =>
                onHighlightCluster(highlightCluster === c ? null : c)
              }
            />
          )
        })}
      </div>

      {/* Highlighted cluster quick stats */}
      {highlightStats && highlightCluster && (
        <div className="glass-card p-4 flex items-center gap-6" style={{ borderColor: CLUSTER_COLORS[highlightCluster], borderLeftWidth: 4 }}>
          <div>
            <div className="text-xs text-slate-400">Cluster {highlightCluster}</div>
            <div className="text-sm font-semibold text-slate-100">{CLUSTER_NAMES[highlightCluster]}</div>
          </div>
          <div className="flex gap-6 text-xs">
            <div><span className="text-slate-400">Members:</span> <span className="text-slate-200 font-medium">{highlightStats.count}</span></div>
            <div><span className="text-slate-400">Avg PMPY:</span> <span className="text-slate-200 font-medium">{formatCurrency(highlightStats.avgCost)}</span></div>
            <div><span className="text-slate-400">Diabetes:</span> <span className="text-slate-200 font-medium">{formatPercent(highlightStats.pctDiabetes, 0)}</span></div>
            <div><span className="text-slate-400">Heart Dz:</span> <span className="text-slate-200 font-medium">{formatPercent(highlightStats.pctHeart, 0)}</span></div>
            <div><span className="text-slate-400">ESRD:</span> <span className="text-slate-200 font-medium">{formatPercent(highlightStats.pctESRD, 0)}</span></div>
            <div><span className="text-slate-400">Avg ER:</span> <span className="text-slate-200 font-medium">{formatDecimal(highlightStats.avgER, 1)}/yr</span></div>
            <div><span className="text-slate-400">Risk Score:</span> <span className="text-slate-200 font-medium">{formatDecimal(highlightStats.avgRiskScore, 3)}</span></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-slate-200 mb-2">
            2D Population Projection (t-SNE)
          </h3>
          <ClusterScatter highlightCluster={highlightCluster} />
        </div>
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-slate-200 mb-2">
            Cluster Comparison Radar
          </h3>
          <ClusterRadar highlightCluster={highlightCluster} />
        </div>
      </div>

      <div className="glass-card p-4 border-l-4" style={{ borderColor: takeawayColor }}>
        <p className="text-sm text-slate-300">
          <span className="font-semibold" style={{ color: takeawayColor }}>Takeaway:</span>{" "}
          {takeaway}
        </p>
      </div>
    </div>
  )
}
